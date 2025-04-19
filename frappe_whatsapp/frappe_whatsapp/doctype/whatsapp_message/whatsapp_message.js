// Copyright (c) 2022, Shridhar Patil and contributors
// For license information, please see license.txt

frappe.ui.form.on('WhatsApp Message', {
	refresh: function(frm) {
		if (frm.doc.type === 'Incoming') {
			frm.add_custom_button(__("Reply"), function() {
				frappe.new_doc("WhatsApp Message", {
					to: frm.doc.from,
					reply_to_message_id: frm.doc.message_id,
					is_reply: 1
				});
			});
		} else if (frm.doc.type === 'Outgoing') {
			frm.add_custom_button(__("Reply"), function() {
				frappe.new_doc("WhatsApp Message", {
					to: frm.doc.to,
					reply_to_message_id: frm.doc.message_id,
					is_reply: 1
				});
			});
		}
	},

	use_template: function(frm) {
        if (frm.doc.use_template) {
            frm.set_value('message_type', 'Template');
        } else {
            frm.set_value('message_type', 'Manual');
        }
    },

	template: function(frm) {
        update_attach_field_mandatory(frm);
    }
});

function update_attach_field_mandatory(frm) {
    if (!frm.doc.template || frm.doc.template == 0) {
        // No template selected
        frm.fields_dict['attach'].df.reqd = 0;
        frm.set_df_property('fields', 'hidden', 1); // hide 'fields' field
        frm.refresh_fields(['attach', 'custom_data']);
    } else {
        // Fetch selected template
        frappe.db.get_doc('WhatsApp Templates', frm.doc.template).then(template => {
            // Set attach mandatory if header_type is IMAGE or DOCUMENT
            if (template.header_type === 'IMAGE' || template.header_type === 'DOCUMENT') {
                frm.fields_dict['attach'].df.reqd = 1;
            } else {
                frm.fields_dict['attach'].df.reqd = 0;
            }

            // Show or hide 'fields' based on presence of sample_value
            if (template.sample_values) {
                frm.set_df_property('custom_data', 'hidden', 0);
            } else {
                frm.set_df_property('custom_data', 'hidden', 1);
            }

            frm.refresh_fields(['attach', 'fields']);
        });
    }
}


frappe.ui.form.on('WhatsApp Message', {
    refresh: function(frm) {
        // Generate preview on form load
        generate_whatsapp_preview(frm);

        // Attach field change listeners to update preview dynamically
        frm.fields_dict.message.df.change = () => generate_whatsapp_preview(frm);
        frm.fields_dict.attach.df.change = () => generate_whatsapp_preview(frm);
        frm.fields_dict.type.df.change = () => generate_whatsapp_preview(frm);
        frm.fields_dict.template.df.change = () => generate_whatsapp_preview(frm);
        frm.fields_dict.profile_name.df.change = () => generate_whatsapp_preview(frm);
        frm.fields_dict.from.df.change = () => generate_whatsapp_preview(frm);
        frm.fields_dict.to.df.change = () => generate_whatsapp_preview(frm);

        // Refresh the form fields to apply the listeners
        frm.refresh_fields();
    }
});

function generate_whatsapp_preview(frm) {
    // Determine alignment based on the "type" field
    const isOutgoing = frm.doc.type === "Outgoing";
    const messageAlignment = isOutgoing ? "flex-end" : "flex-start"; // Align the bubble itself
    const messageBackgroundColor = isOutgoing ? "#DCF8C6" : "white"; // Green for outgoing, white for incoming
    const messageBorderRadius = isOutgoing 
        ? "border-top-right-radius: 2px; border-bottom-left-radius: 12px;" 
        : "border-top-left-radius: 2px; border-bottom-right-radius: 12px;";
	let wrappedMessage = `<div style="margin-top: 4px; margin-bottom: 4px; font-size: 14px; line-height: 1.4; color: #303030; word-wrap: break-word; white-space: pre-wrap;">${frm.doc.message || ""}</div>`;

    let previewHTML = `
        <div style="max-width: 500px; margin: 20px auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); background-color: white; overflow: hidden;">
          <div style="background-color: #128C7E; color: white; padding: 12px 18px; display: flex; align-items: center;">
            <div style="width: 45px; height: 45px; border-radius: 50%; background-color: #0c6b5f; margin-right: 12px; display: flex; align-items: center; justify-content: center;"></div>
            <div>
              <div style="font-weight: bold; font-size: 16px; margin-bottom: 3px;">${frm.doc.profile_name || "Unknown"}</div>
              <div style="font-size: 12px; opacity: 0.9;">+${frm.doc.from || frm.doc.to}</div>
            </div>
          </div>
          <div style="padding: 15px 18px; background-color: #e9edef; min-height: 220px; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: ${messageAlignment};">
				<div  style="background-color: ${messageBackgroundColor}; border-radius: 12px; max-width: 85%; margin-bottom: 10px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); position: relative; ${messageBorderRadius}">
					<div style="padding: 12px;">
						<div id="header" style="text-align: left;"></div>
						${frm.doc.attach ? `<img src="${frm.doc.attach}" alt="Message Image" style="max-width: 100%; border-radius: 8px; display: block;">` : ''}
						${frm.doc.template ? '' : `<div style="margin-top: 8px; font-size: 14px; line-height: 1.4; color: #303030;">${wrappedMessage}</div>`}
						<div id="template-content" style="margin-top: 0px; margin-bottom: 0px; font-size: 14px; line-height: 1.4; color: #303030;"></div>
						<div style="display: flex; justify-content: space-between; font-size: 11px; color: #8d8d8d; margin-top: 7px; margin-bottom: -13px;">
							<div id="footer" style="text-align: left;"></div>
							<div style="text-align: right;">${frm.doc.creation ? frm.doc.creation.substring(11, 16) : "12:30"}</div>
						</div>
					</div>
					<div id="buttons-content" style="margin-top: 8px; display: flex; flex-direction: column; gap: 6px;"></div>
				</div>
            </div>
          </div>
        </div>
    `;

	if (frm.doc.template) {
        frappe.call({
            method: "frappe.client.get",
            args: {
                doctype: "WhatsApp Templates",
                name: frm.doc.template
            },
            callback: function(r) {
                if (r.message) {
                    const data = r.message;
                    const template_text = data.template || "";
                    const buttons = data.buttons || [];

                    // Wrap template
					let wrappedTemplate = `<div style="white-space: pre-wrap;">${template_text.replace(/\n/g, '<br>')}</div>`;

					previewHTML = previewHTML.replace(
						'<div id="template-content" style="margin-top: 0px; margin-bottom: 0px; font-size: 14px; line-height: 1.4; color: #303030;"></div>',
						`<div id="template-content" style="margin-top: 0px; margin-bottom: 0px; font-size: 14px; line-height: 1.4; color: #303030;">${wrappedTemplate}</div>`
					);
					
					if (data.header) {
						previewHTML = previewHTML.replace(
							'<div id="header" style="text-align: left;"></div>',
							`<div id="header" style="text-align: left; color:rgb(0, 0, 0); margin-bottom: 8px;"><b>${data.header}</b></div>`
						);
					}

					if (data.footer) {
						previewHTML = previewHTML.replace(
							'<div id="footer" style="text-align: left;"></div>',
							`<div id="footer" style="text-align: left;">${data.footer}</div>`
						);
					}


                    // Add buttons
                    let buttonHTML = buttons.map(btn => {
                        if (btn.type === "URL") {
                            return `<a href="${btn.url}" target="_blank" style="text-decoration: none;">
                                <div style="padding: 8px 12px; border-top: 1px solid #cccccc; text-align: center; color: #3ba1c5; font-weight: bold;"><i class="fa fa-external-link" aria-hidden="true"></i>  ${btn.text}</div>
                            </a>`;
                        } else if (btn.type === "PHONE NUMBER") {
                            return `<div style="padding: 8px 12px; border-top: 1px solid #cccccc; text-align: center; color: #3ba1c5; font-weight: bold;"><i class="fa fa-phone" aria-hidden="true"></i> ${btn.text}</div>`;
                        } else {
                            return `<div style="padding: 8px 12px; border-top: 1px solid #cccccc; text-align: center;">${btn.text}</div>`;
                        }
                    }).join("");

                    previewHTML = previewHTML.replace(
                        '<div id="buttons-content" style="margin-top: 8px; display: flex; flex-direction: column; gap: 6px;"></div>',
                        `<div id="buttons-content" style="margin-top: 8px; margin-bottom: 8px; display: flex; flex-direction: column; gap: 6px;">${buttonHTML}</div>`
                    );

                    frm.set_df_property('message_preview', 'options', `<option value="preview">${previewHTML}</option>`);
                    frm.refresh_field('message_preview');
                }
            }
		});
    } else {
        // Dynamically set the option with the HTML preview if no template
        frm.set_df_property('message_preview', 'options', `<option value="preview">${previewHTML}</option>`);
        frm.refresh_field('message_preview');
    }
}