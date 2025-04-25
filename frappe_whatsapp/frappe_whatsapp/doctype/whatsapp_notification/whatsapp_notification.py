"""Notification."""

import json
import frappe
from frappe.model.document import Document
from frappe.utils.safe_exec import get_safe_globals, safe_exec
from frappe.integrations.utils import make_post_request
from frappe.desk.form.utils import get_pdf_link
from frappe.utils import add_to_date, nowdate, datetime


class WhatsAppNotification(Document):
    """Notification."""

    def validate(self):
        """Validate."""
        if self.notification_type == "DocType Event":
            fields = frappe.get_doc("DocType", self.reference_doctype).fields
            fields += frappe.get_all(
                "Custom Field",
                filters={"dt": self.reference_doctype},
                fields=["fieldname"]
            )
            if not any(field.fieldname == self.field_name for field in fields): # noqa
                frappe.throw(f"Field name {self.field_name} does not exists")
        if self.custom_attachment:
            if not self.attach and not self.attach_from_field:
                frappe.throw("Either <b>Attach</b> a file or add a <b>Attach from field</b> to send attachemt")

    def send_scheduled_message(self) -> dict:
        """Specific to API endpoint Server Scripts."""
        safe_exec(
            self.condition, get_safe_globals(), dict(doc=self)
        )
        language_code = frappe.db.get_value(
            "WhatsApp Templates", self.template,
            fieldname='language_code'
        )
        template_actual_name = frappe.db.get_value(
            "WhatsApp Templates", self.template,
            fieldname='actual_name'
        )
        if language_code:
            for contact in self._contact_list:
                data = {
                    "messaging_product": "whatsapp",
                    "to": self.format_number(contact),
                    "type": "template",
                    "template": {
                        "name": template_actual_name,
                        "language": {
                            "code": language_code
                        },
                        "components": []
                    }
                }
                self.content_type = template.get("header_type", "text").lower()
                self.notify(data)
        # return _globals.frappe.flags

    def send_template_message(self, doc: Document):
        """Specific to Document Event triggered Server Scripts."""
        if self.disabled:
            return

        doc_data = doc.as_dict()
        if self.condition:
            # check if condition satisfies
            if not frappe.safe_eval(
                self.condition, get_safe_globals(), dict(doc=doc_data)
            ):
                return

        template = frappe.db.get_value(
            "WhatsApp Templates", self.template,
            fieldname='*'
        )

        if template:
            data = {
                "messaging_product": "whatsapp",
                "to": self.format_number(doc_data[self.field_name]),
                "type": "template",
                "template": {
                    "name": template.actual_name,
                    "language": {
                        "code": template.language_code
                    },
                    "components": []
                }
            }

            # Pass parameter values
            if self.fields:
                parameters = []
                for field in self.fields:
                    value = doc_data[field.field_name]
                    if isinstance(doc_data[field.field_name], (datetime.date, datetime.datetime)):
                        value = str(doc_data[field.field_name])
                    parameters.append({
                        "type": "text",
                        "text": value
                    })

                data['template']["components"] = [{
                    "type": "body",
                    "parameters": parameters
                }]

            if self.attach_document_print:
                # frappe.db.begin()
                key = doc.get_document_share_key()  # noqa
                frappe.db.commit()
                print_format = "Standard"
                doctype = frappe.get_doc("DocType", doc_data['doctype'])
                if doctype.custom:
                    if doctype.default_print_format:
                        print_format = doctype.default_print_format
                else:
                    default_print_format = frappe.db.get_value(
                        "Property Setter",
                        filters={
                            "doc_type": doc_data['doctype'],
                            "property": "default_print_format"
                        },
                        fieldname="value"
                    )
                    print_format = default_print_format if default_print_format else print_format
                link = get_pdf_link(
                    doc_data['doctype'],
                    doc_data['name'],
                    print_format=print_format
                )

                filename = f'{doc_data["name"]}.pdf'
                url = f'{frappe.utils.get_url()}{link}&key={key}'

            elif self.custom_attachment:
                filename = self.file_name

                if self.attach_from_field:
                    file_url = doc_data[self.attach_from_field]
                    if not file_url.startswith("http"):
                        # get share key so that private files can be sent
                        key = doc.get_document_share_key()
                        file_url = f'{frappe.utils.get_url()}{file_url}&key={key}'
                else:
                    file_url = self.attach

                if file_url.startswith("http"):
                    url = f'{file_url}'
                else:
                    url = f'{frappe.utils.get_url()}{file_url}'

            if template.header_type == 'DOCUMENT':
                data['template']['components'].append({
                    "type": "header",
                    "parameters": [{
                        "type": "document",
                        "document": {
                            "link": url,
                            "filename": filename
                        }
                    }]
                })
            elif template.header_type == 'IMAGE':
                data['template']['components'].append({
                    "type": "header",
                    "parameters": [{
                        "type": "image",
                        "image": {
                            "link": url
                        }
                    }]
                })
            self.content_type = template.header_type.lower()
            data["whatsapp_notification"] = self.name
            data["doc_name"] = doc.name
            self.notify(data)

    def notify(self, data):
        """Notify."""
        settings = frappe.get_doc("WhatsApp Settings", "WhatsApp Settings")
        not_doc_name = data.get("whatsapp_notification")
        doc = frappe.get_doc("WhatsApp Notification", not_doc_name)
        reference_doctype = doc.reference_doctype
        reference_document = data.get("doc_name")
        
        token = settings.get_password("token")
        headers = {
            "authorization": f"Bearer {token}",
            "content-type": "application/json"
        }
        
        try:
            success = False
            
            # Get the template name and fetch from WhatsApp Templates doctype
            template_name = self.template
            template_content = self.get_template_content(template_name)
            
            # Get data from reference document for variable replacement
            variables = self.get_variables_from_reference(reference_doctype, reference_document, doc, data)

            # Replace variables in the template
            message_text = self.replace_template_variables(template_content, variables)


            response = make_post_request(
                f"{settings.url}/{settings.version}/{settings.phone_id}/messages",
                headers=headers, data=json.dumps(data)
            )

            if not self.get("content_type"):
                self.content_type = 'text'

            frappe.get_doc({
                "doctype": "WhatsApp Message",
                "type": "Outgoing",
                "message": message_text,
                "to": data['to'],
                "message_type": "Template",
                "message_id": response['messages'][0]['id'],
                "content_type": self.content_type,
                "reference_doctype": reference_doctype
            }).save(ignore_permissions=True)

            frappe.msgprint("WhatsApp Message Triggered", indicator="green", alert=True)
            success = True

        except Exception as e:
            error_message = str(e)
            if frappe.flags.integration_request:
                response = frappe.flags.integration_request.json()['error']
                error_message = response.get('Error', response.get("message"))

            frappe.msgprint(
                f"Failed to trigger whatsapp message: {error_message}",
                indicator="red",
                alert=True
            )
        finally:
            if not success:
                meta = {"error": error_message}
            else:
                meta = frappe.flags.integration_request.json()
            frappe.get_doc({
                "doctype": "WhatsApp Notification Log",
                "template": self.template,
                "meta_data": meta
            }).insert(ignore_permissions=True)

    def get_variables_from_reference(self, reference_doctype, reference_document, notification_doc, data_param=None):
        """
        Fetch data from reference document and its child tables for variable replacement.
        """
        variables = {}
        
        if not reference_document:
            return variables
        
        try:
            # Get the reference document
            ref_doc = frappe.get_doc(reference_doctype, reference_document)
            
            # Get field mappings from notification doc
            field_mappings = []
            if notification_doc and hasattr(notification_doc, "get"):
                field_mappings = notification_doc.get("fields", [])
            
            # Process each field mapping with index for numeric variables
            for idx, field in enumerate(field_mappings, start=1):
                field_name = field.get("field_name") if hasattr(field, "get") else None
                variable_name = field.get("variable_name") if hasattr(field, "get") and field.get("variable_name") else str(idx)
                
                if not field_name:
                    continue
                    
                # Extract value based on field name
                if "." in field_name:
                    # Handle child table fields
                    parts = field_name.split(".")
                    child_table, child_field = parts[0], parts[1]
                    
                    if hasattr(ref_doc, "get") and child_table and child_field:
                        child_rows = ref_doc.get(child_table, [])
                        if child_rows and child_rows[0]:
                            child_row = child_rows[0]
                            if hasattr(child_row, "get"):
                                value = child_row.get(child_field)
                                if value is not None:
                                    variables[variable_name] = value
                else:
                    # Handle main document fields
                    if hasattr(ref_doc, "get"):
                        value = ref_doc.get(field_name)
                        if value is not None:
                            variables[variable_name] = value
            
            # Handle data specified directly in the components
            if data_param and isinstance(data_param, dict):
                # Extract values from template components if available
                if "template" in data_param and "components" in data_param["template"]:
                    components = data_param["template"].get("components", [])
                    for component in components:
                        if component.get("type") == "body" and "parameters" in component:
                            parameters = component.get("parameters", [])
                            for idx, param in enumerate(parameters, start=1):
                                if param.get("type") == "text" and "text" in param:
                                    variables[str(idx)] = param.get("text")
                
                # Also check traditional variables dict if present
                additional_vars = data_param.get("variables", {})
                if additional_vars and isinstance(additional_vars, dict):
                    variables.update(additional_vars)
        
        except Exception:
            pass
        
        return variables
    
    def get_template_content(self, template_name):
        """Fetch the template content from WhatsApp Templates doctype."""
        try:
            template_doc = frappe.get_doc("WhatsApp Templates", template_name)
            return template_doc.template
        except Exception as e:
            frappe.throw(f"Template '{template_name}' not found: {str(e)}")

    def replace_template_variables(self, template_content, variables):
        """Replace variables in the template with actual values."""
        debug_info = {
            "Template before": template_content,
            "Variables": variables
        }
        
        message = template_content
        for key, value in variables.items():
            placeholder = "{{" + key + "}}"
            message = message.replace(placeholder, str(value))
            debug_info[f"Replaced {placeholder}"] = value
        
        debug_info["Final message"] = message
              
        return message

    def on_trash(self):
        """On delete remove from schedule."""
        frappe.cache().delete_value("whatsapp_notification_map")


    def format_number(self, number):
        """Format number."""
        if (number.startswith("+")):
            number = number[1:len(number)]

        return number


    def get_documents_for_today(self):
        """get list of documents that will be triggered today"""
        docs = []

        diff_days = self.days_in_advance
        if self.doctype_event == "Days After":
            diff_days = -diff_days

        reference_date = add_to_date(nowdate(), days=diff_days)
        reference_date_start = reference_date + " 00:00:00.000000"
        reference_date_end = reference_date + " 23:59:59.000000"

        doc_list = frappe.get_all(
            self.reference_doctype,
            fields="name",
            filters=[
                {self.date_changed: (">=", reference_date_start)},
                {self.date_changed: ("<=", reference_date_end)},
            ],
        )

        for d in doc_list:
            doc = frappe.get_doc(self.reference_doctype, d.name)
            self.send_template_message(doc)
            # print(doc.name)


@frappe.whitelist()
def call_trigger_notifications():
    """Trigger notifications."""
    try:
        trigger_notifications()  
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Error in call_trigger_notifications")
        raise e

def trigger_notifications(method="daily"):
    if frappe.flags.in_import or frappe.flags.in_patch:
        # don't send notifications while syncing or patching
        return

    if method == "daily":
        doc_list = frappe.get_all(
            "WhatsApp Notification", filters={"doctype_event": ("in", ("Days Before", "Days After")), "disabled": 0}
        )
        for d in doc_list:
            alert = frappe.get_doc("WhatsApp Notification", d.name)
            alert.get_documents_for_today()
           