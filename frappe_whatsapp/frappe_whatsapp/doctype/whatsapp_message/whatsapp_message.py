# Copyright (c) 2022, Shridhar Patil and contributors
# For license information, please see license.txt
import json
import frappe
from frappe import _, throw
from frappe.model.document import Document
from frappe.integrations.utils import make_post_request
from frappe.utils import get_url

from frappe_whatsapp.utils import get_whatsapp_account, format_number

class WhatsAppMessage(Document):
    def validate(self):
        self.set_whatsapp_account()

    def on_update(self):
        self.update_profile_name()

    def update_profile_name(self):
        number = self.get("from")
        if not number:
            return
        from_number = format_number(number)

        if (
            self.has_value_changed("profile_name")
            and self.profile_name
            and from_number
            and frappe.db.exists("WhatsApp Profiles", {"number": from_number})
        ):
            profile_id = frappe.get_value("WhatsApp Profiles", {"number": from_number}, "name")
            frappe.db.set_value("WhatsApp Profiles", profile_id, "profile_name", self.profile_name)

    def create_whatsapp_profile(self):
        number = format_number(self.get("from") or self.to)
        if not frappe.db.exists("WhatsApp Profiles", {"number": number}):
            frappe.get_doc({
                "doctype": "WhatsApp Profiles",
                "profile_name": self.profile_name,
                "number": number,
                "whatsapp_account": self.whatsapp_account
            }).insert(ignore_permissions=True)

    def set_whatsapp_account(self):
        """Set whatsapp account to default if missing"""
        if not self.whatsapp_account:
            account_type = 'outgoing' if self.type == 'Outgoing' else 'incoming'
            default_whatsapp_account = get_whatsapp_account(account_type=account_type)
            if not default_whatsapp_account:
                throw(_("Please set a default outgoing WhatsApp Account or Select available WhatsApp Account"))
            else:
                self.whatsapp_account = default_whatsapp_account.name

    """Send whats app messages."""
    def before_insert(self):
        """Send message."""
        self.set_whatsapp_account()
        if self.type == "Outgoing" and self.message_type != "Template":
            if self.attach and not self.attach.startswith("http"):
                link = frappe.utils.get_url() + "/" + self.attach
            else:
                link = self.attach

            data = {
                "messaging_product": "whatsapp",
                "to": format_number(self.to),
                "type": self.content_type,
            }
            if self.is_reply and self.reply_to_message_id:
                data["context"] = {"message_id": self.reply_to_message_id}
            if self.content_type in ["document", "image", "video"]:
                data[self.content_type.lower()] = {
                    "link": link,
                    "caption": self.message,
                }
            elif self.content_type == "reaction":
                data["reaction"] = {
                    "message_id": self.reply_to_message_id,
                    "emoji": self.message,
                }
            elif self.content_type == "text":
                data["text"] = {"preview_url": True, "body": self.message}

            elif self.content_type == "audio":
                data["text"] = {"link": link}

            try:
                self.notify(data)
                self.status = "Success"
            except Exception as e:
                self.status = "Failed"
                frappe.throw(f"Failed to send message {str(e)}")
        elif self.type == "Outgoing" and self.message_type == "Template" and not self.message_id:
            self.send_template()
            self.status = "Success"

        """Find Profile Name."""
        number = self.get("from") or self.get("to")

        if not number or self.profile_name:
            return

        result = frappe.db.sql("""
            SELECT profile_name
            FROM `tabWhatsApp Message`
            WHERE profile_name IS NOT NULL
            AND name != %(current_docname)s
            AND (%(number)s = `from` OR %(number)s = `to`)
            ORDER BY creation DESC
        """, {
            "number": number,
            "current_docname": self.name or ""
        }, as_dict=True)

        if result:
            self.profile_name = result[0].profile_name

        self.create_whatsapp_profile()

    def send_template(self):
        """Send template."""
        template = frappe.get_doc("WhatsApp Templates", self.template)
        data = {
            "messaging_product": "whatsapp",
            "to": format_number(self.to),
            "type": "template",
            "template": {
                "name": template.actual_name or template.template_name,
                "language": {"code": template.language_code},
                "components": [],
            },
        }

        if template.sample_values:
            field_names = template.field_names.split(",") if template.field_names else template.sample_values.split(",")
            parameters = []
            template_parameters = []

            if self.body_param is not None:
                params = list(json.loads(self.body_param).values())
                for param in params:
                    parameters.append({"type": "text", "text": param})
                    template_parameters.append(param)
            elif self.flags.custom_ref_doc:
                custom_values = self.flags.custom_ref_doc
                for field_name in field_names:
                    value = custom_values.get(field_name.strip())
                    parameters.append({"type": "text", "text": value})
                    template_parameters.append(value)

            elif self.custom_data == 1:
                if self.fields:  # Directly check if self.fields exists and is truthy
                    parameters = []
                    for field in self.fields:
                        parameters.append({"type": "text", "text": str(field.field_name)})
                        template_parameters.append(field.field_name)
                pass

            else:
                ref_doc = frappe.get_doc(self.reference_doctype, self.reference_name)
                for field_name in field_names:
                    value = ref_doc.get_formatted(field_name.strip())
                    parameters.append({"type": "text", "text": value})
                    template_parameters.append(value)

            
            self.template_parameters = json.dumps(template_parameters)
            data["template"]["components"].append(
                {
                    "type": "body",
                    "parameters": parameters,
                }
            )

        # Handle header parameters
        if template.header_type:
            if template.header_type in ["IMAGE", "DOCUMENT", "VIDEO"]:
                if not self.attach:
                    frappe.throw(f"This template requires a {template.header_type.lower()}, but 'Attach' field is empty.")
                
                file_url = get_url(self.attach)
                header_type = template.header_type.lower()
                
                parameter = {
                    "type": header_type,
                    header_type: {
                        "link": file_url
                    }
                }
                
                # Handle document filename
                if header_type == "document":
                    # Try to get filename from the attachment path
                    import os
                    filename = os.path.basename(self.attach)
                    if filename:
                        parameter["document"]["filename"] = filename
                
                data["template"]["components"].append({
                    "type": "header",
                    "parameters": [parameter]
                })
                
            elif template.sample:  # For text-type headers
                field_names = template.sample.split(",")
                header_parameters = []
                template_header_parameters = []

                ref_doc = frappe.get_doc(self.reference_doctype, self.reference_name)
                for field_name in field_names:
                    value = ref_doc.get_formatted(field_name.strip())
                    
                    header_parameters.append({"type": "text", "text": value})
                    template_header_parameters.append(value)

                self.template_header_parameters = json.dumps(template_header_parameters)

                data["template"]["components"].append({
                    "type": "header",
                    "parameters": header_parameters,
                })

        if self.message_type == "Template" and template.sample_values:
            # Store all parameters for later use in message replacement
            self.all_parameters = template_parameters
            
        self.notify(data)

    def notify(self, data):
        """Notify."""
        whatsapp_account = frappe.get_doc(
            "WhatsApp Account",
            self.whatsapp_account,
        )
        token = settings.get_password("token")
        
        headers = {
            "authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        try:
            response = make_post_request(
                f"{whatsapp_account.url}/{whatsapp_account.version}/{whatsapp_account.phone_id}/messages",
                headers=headers,
                data=json.dumps(data),
            )
            self.message_id = response["messages"][0]["id"]

            # Get the template content
            if self.message_type == "Template":
                template_name = self.template
                template_doc = frappe.get_doc("WhatsApp Templates", template_name)
                template_content = template_doc.template

                # Initialize message text with the original template content
                message_text = template_content            
            
                if template_doc.sample_values:
                    # Parse the template parameters from JSON
                    parameters = []
                    if self.template_parameters:
                        try:
                            parameters = json.loads(self.template_parameters)
                        except:
                            pass
                    
                    # Replace variables in the format {{1}}, {{2}}, etc.
                    for idx, param_value in enumerate(parameters, 1):
                        placeholder = "{{" + str(idx) + "}}"
                        message_text = message_text.replace(placeholder, str(param_value))
            
                # Save the final message text
                self.message = message_text
            
                # If document already exists in the database, use db_set
                if hasattr(self, 'is_new') and not self.is_new and self.name:
                    frappe.db.set_value("WhatsApp Message", self.name, "message", message_text)
                    frappe.db.commit()
                else:
                    None
                    
        except Exception as e:
            res = frappe.flags.integration_request.json().get("error", {})
            error_message = res.get("Error", res.get("message"))
            frappe.get_doc(
                {
                    "doctype": "WhatsApp Notification Log",
                    "template": "Text Message",
                    "meta_data": frappe.flags.integration_request.json(),
                }
            ).insert(ignore_permissions=True)

            frappe.throw(msg=error_message, title=res.get("error_user_title", "Error"))

    def format_number(self, number):
        """Format number."""
        number = str(number)
        if number.startswith("+"):
            number = number[1 : len(number)]

        return number

    @frappe.whitelist()
    def send_read_receipt(self):
        data = {
            "messaging_product": "whatsapp",
            "status": "read",
            "message_id": self.message_id
        }

        settings = frappe.get_doc(
            "WhatsApp Account",
            self.whatsapp_account,
        )

        token = settings.get_password("token")

        headers = {
            "authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        try:
            response = make_post_request(
                f"{settings.url}/{settings.version}/{settings.phone_id}/messages",
                headers=headers,
                data=json.dumps(data),
            )

            if response.get("success"):
                self.status = "marked as read"
                self.save()
                return response.get("success")

        except Exception as e:
            res = frappe.flags.integration_request.json().get("error", {})
            error_message = res.get("Error", res.get("message"))
            frappe.log_error("WhatsApp API Error", f"{error_message}\n{res}")


def on_doctype_update():
    frappe.db.add_index("WhatsApp Message", ["reference_doctype", "reference_name"])


@frappe.whitelist()
def send_template(to, reference_doctype, reference_name, template):
    try:
        doc = frappe.get_doc({
            "doctype": "WhatsApp Message",
            "to": to,
            "type": "Outgoing",
            "message_type": "Template",
            "reference_doctype": reference_doctype,
            "reference_name": reference_name,
            "content_type": "text",
            "template": template
        })

        doc.save()
    except Exception as e:
        raise e
