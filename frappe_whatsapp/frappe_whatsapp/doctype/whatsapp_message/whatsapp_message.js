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
