# Bulk WhatsApp Messaging for Frappe WhatsApp
# bulk_whatsapp_messaging.py

import frappe
from frappe import _
import json
from frappe.utils import cint, get_datetime, now
from frappe.model.document import Document
from frappe.model.naming import make_autoname

# Add these files to your frappe_whatsapp app

# 1. First, create a new DocType for Bulk WhatsApp Messaging
# Save this as a Python file in your app's folder: 
# frappe_whatsapp/frappe_whatsapp/doctype/bulk_whatsapp_message/bulk_whatsapp_message.py

class BulkWhatsAppMessage(Document):
    def autoname(self):
        self.name = make_autoname("BULK-WA-.YYYY.-.#####")
    
    def validate(self):
        # self.validate_message()
        self.validate_recipients()
        self.validate_template_with_files()
    
    def validate_message(self):
        if not self.message_content:
            frappe.throw(_("Message content is required"))
    
    def validate_recipients(self):
        if not self.recipients and not self.recipient_list:
            frappe.throw(_("At least one recipient or a recipient list is required"))
        
        # If recipient list is provided, count recipients
        if self.recipient_type == 'Recipient List' and self.recipient_list:
            recipient_count = frappe.db.count("WhatsApp Recipient", {"parent": self.recipient_list})
            if recipient_count == 0:
                frappe.throw(_("Selected recipient list has no recipients"))
            self.recipient_count = recipient_count
        # If individual recipients are provided
        elif self.recipients:
            self.recipient_count = len(self.recipients)
    
    def validate_template_with_files(self):
        """Validate template with file attachments"""
        if self.use_template and self.template:
            template_doc = frappe.get_doc("WhatsApp Templates", self.template)
            
            # Check if template has header that requires file
            if template_doc.header_type in ["IMAGE", "DOCUMENT", "VIDEO"]:
                if not self.attach:
                    frappe.throw(_("This template requires a {0}, but 'Attach' field is empty").format(template_doc.header_type.lower()))
                
                # Validate file type matches template header type
                if self.attach:
                    file_ext = self.attach.split('.')[-1].lower()
                    if template_doc.header_type == "IMAGE" and file_ext not in ['jpg', 'jpeg', 'png', 'gif', 'webp']:
                        frappe.throw(_("Template requires an image file, but attached file is not an image"))
                    elif template_doc.header_type == "VIDEO" and file_ext not in ['mp4', 'avi', 'mov', 'wmv', 'flv']:
                        frappe.throw(_("Template requires a video file, but attached file is not a video"))
                    elif template_doc.header_type == "DOCUMENT" and file_ext in ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'avi', 'mov']:
                        frappe.throw(_("Template requires a document file, but attached file is an image or video"))
    
    def on_submit(self):
        self.db_set("status", "Queued")
        self.queue_messages()
    
    def queue_messages(self):
        """Queue messages for sending"""
        if self.recipient_type == 'Recipient List' and self.recipient_list:
            # Fetch recipients from the recipient list
            recipients = frappe.get_all(
                "WhatsApp Recipient", 
                filters={"parent": self.recipient_list},
                fields=["mobile_number", "name", "recipient_name", "recipient_data"]
            )
            
            for recipient in recipients:
                frappe.enqueue_doc(
                    self.doctype, self.name,
                    "create_single_message",
                    "long", 4000,
                    recipient=recipient
                )
        else:
            # Use recipients from the current document
            for recipient in self.recipients:
                frappe.enqueue_doc(
                    self.doctype, self.name,
                    "create_single_message",
                    "long", 4000,
                    recipient=recipient
                )
    
    def create_single_message(self, recipient):
        """Create a single message in the queue"""
        # message_content = self.message_content
        
        # Replace variables in the message if any
        self.status == "In Progress"
        if recipient.get("recipient_data"):
            try:
                variables = json.loads(recipient.get("recipient_data", "{}"))
                # for var_name, var_value in variables.items():
                #     message_content = message_content.replace(f"{{{{{var_name}}}}}", str(var_value))
            except Exception as e:
                frappe.log_error(f"Error parsing recipient data: {str(e)}", "WhatsApp Bulk Messaging")
        
        # Create WhatsApp message
        wa_message = frappe.new_doc("WhatsApp Message")
        wa_message.to = recipient.get("mobile_number")
        wa_message.type = "Outgoing"
        wa_message.bulk_message_reference = self.name
        
        # Since use_template defaults to 1, always handle as template
        if self.use_template:
            wa_message.template = self.template
            wa_message.message_type = 'Template'
            wa_message.use_template = self.use_template
            wa_message.content_type = "text"  # Default for templates
            
            # Handle template variables if needed
            if self.template_variables:
                wa_message.template_variables = self.template_variables
            
            # Add file attachment support for templates
            if self.attach:
                wa_message.attach = self.attach
                
            # Set custom reference doc for template parameter replacement
            wa_message.flags.custom_ref_doc = json.loads(recipient.get("recipient_data", "{}"))
        else:
            # For non-template messages (rarely used since use_template defaults to 1)
            wa_message.message_type = "Text"
            wa_message.content_type = "text"
            
            # Handle file attachments for non-template messages
            if self.attach:
                wa_message.attach = self.attach
                # Determine content type based on file extension
                file_ext = self.attach.split('.')[-1].lower()
                if file_ext in ['jpg', 'jpeg', 'png', 'gif', 'webp']:
                    wa_message.content_type = "image"
                elif file_ext in ['mp4', 'avi', 'mov', 'wmv', 'flv']:
                    wa_message.content_type = "video"
                elif file_ext in ['mp3', 'wav', 'ogg', 'aac']:
                    wa_message.content_type = "audio"
                else:
                    wa_message.content_type = "document"
        
        # Set status to queued
        wa_message.status = "Queued"
        
        try:
            wa_message.insert(ignore_permissions=True)
            # Update message count on successful insertion
            self.db_set("sent_count", cint(self.sent_count) + 1)
            if self.recipient_count == self.sent_count:
                self.db_set("status", "Completed")
        except Exception as e:
            frappe.log_error(f"Error creating WhatsApp message: {str(e)}", "WhatsApp Bulk Messaging")
            self.db_set("status", "Partially Failed")

    def retry_failed(self):
        """Retry failed messages"""
        failed_messages = frappe.get_all(
            "WhatsApp Message",
            filters={
                "bulk_message_reference": self.name,
                "status": "Failed"
            },
            fields=["name"]
        )
        
        count = 0
        for msg in failed_messages:
            message_doc = frappe.get_doc("WhatsApp Message", msg.name)
            message_doc.status = "Queued"
            message_doc.save(ignore_permissions=True)
            count += 1
        
        frappe.msgprint(_("{0} messages have been requeued for sending").format(count))
        
    def get_progress(self):
        """Get sending progress for this bulk message"""
        total = self.recipient_count
        sent = frappe.db.count("WhatsApp Message", {
            "bulk_message_reference": self.name,
            "status": ["in", ["sent","delivered", "Success", "read"]]
        })
        failed = frappe.db.count("WhatsApp Message", {
            "bulk_message_reference": self.name,
            "status": "Failed"
        })
        queued = frappe.db.count("WhatsApp Message", {
            "bulk_message_reference": self.name,
            "status": "Queued"
        })
        
        return {
            "total": total,
            "sent": sent,
            "failed": failed,
            "queued": queued,
            "percent": (sent / total * 100) if total else 0
        }

    def get_message_stats(self):
        """Get detailed message statistics"""
        stats = {
            "total": self.recipient_count,
            "success": 0,
            "failed": 0,
            "queued": 0,
            "sent": 0,
            "delivered": 0,
            "read": 0
        }
        
        # Get all messages for this bulk campaign
        messages = frappe.get_all(
            "WhatsApp Message",
            filters={"bulk_message_reference": self.name},
            fields=["status"]
        )
        
        for msg in messages:
            status = msg.status.lower()
            if status == "success":
                stats["success"] += 1
            elif status == "failed":
                stats["failed"] += 1
            elif status == "queued":
                stats["queued"] += 1
            elif status == "sent":
                stats["sent"] += 1
            elif status == "delivered":
                stats["delivered"] += 1
            elif status == "read":
                stats["read"] += 1
        
        return stats

    def cancel_pending_messages(self):
        """Cancel all pending/queued messages"""
        pending_messages = frappe.get_all(
            "WhatsApp Message",
            filters={
                "bulk_message_reference": self.name,
                "status": "Queued"
            },
            fields=["name"]
        )
        
        count = 0
        for msg in pending_messages:
            frappe.db.set_value("WhatsApp Message", msg.name, "status", "Cancelled")
            count += 1
        
        if count > 0:
            self.db_set("status", "Cancelled")
            frappe.db.commit()
            frappe.msgprint(_("{0} pending messages have been cancelled").format(count))
        else:
            frappe.msgprint(_("No pending messages to cancel"))

    def get_failed_messages(self):
        """Get list of failed messages with details"""
        failed_messages = frappe.get_all(
            "WhatsApp Message",
            filters={
                "bulk_message_reference": self.name,
                "status": "Failed"
            },
            fields=["name", "to", "creation", "error_message"]
        )
        
        return failed_messages