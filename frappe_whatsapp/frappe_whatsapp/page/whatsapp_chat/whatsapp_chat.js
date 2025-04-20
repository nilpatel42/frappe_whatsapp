frappe.pages['whatsapp-chat'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'WhatsApp Chat',
        single_column: true
    });
    
    // Initialize the chat interface
    new WhatsAppChatInterface(page);
};

class WhatsAppChatInterface {
    constructor(page) {
        this.page = page;
        this.setup_page_layout();
        this.load_contacts();
    }
    
    setup_page_layout() {
        // Create a layout with contacts on left and messages on right
        this.page.main.html(`
            <div class="chat-container">
                <div class="chat-sidebar">
                    <div class="chat-search">
                        <input type="text" id="contact-search" placeholder="🔍︎   Search">
                    </div>
                    <div class="contact-list"></div>
                </div>
                <div class="chat-content">
                    <div class="chat-header">
						<div class="contact-avatar">
							
						</div>
                        <div class="current-contact"></div>
                    </div>
                    <div class="chat-messages"></div>
                    <div class="chat-input-container">
                        <textarea id="message-input" placeholder="Type a message"></textarea>
                        <div class="chat-actions">
                            <button class="btn btn-primary btn-send">Send</button>
                            <button class="btn btn-default btn-use-template">Use Template</button>
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        this.add_styles();
        this.setup_events();
    }
    
    // add_styles() {
    //     // Add CSS for the chat interface
    //     $('<style>').text(`
	// 		.chat-container {
	// 			display: flex;
	// 			height: calc(100vh - 170px);
	// 			background-color: #dadbd3; /* WhatsApp light gray background */
	// 		}
	// 		.chat-sidebar {
	// 			width: 30%;
	// 			border-right: 1px solid #d1d7db;
	// 			display: flex;
	// 			flex-direction: column;
	// 			background-color: #ffffff;
	// 		}
	// 		.chat-search {
	// 			padding: 10px;
	// 			border-bottom: 1px solid #e0e0e0;
	// 		}
	// 		.chat-search input {
	// 			background-color: #f0f2f5;
	// 			border-radius: 18px;
	// 			border: none;
	// 			padding: 8px 12px;
	// 			color: #333333; /* Darker text for better readability */
	// 			width: 100%;
	// 		}
	// 		.contact-list {
	// 			flex: 1;
	// 			overflow-y: auto;
	// 		}
	// 		.contact-item {
	// 			padding: 12px 15px;
	// 			border-bottom: 1px solid #f0f0f0;
	// 			cursor: pointer;
	// 			color: #111b21; /* WhatsApp dark text */
	// 			font-weight: 400;
	// 		}
	// 		.contact-item:hover {
	// 			background-color: #f5f6f6;
	// 		}
	// 		.contact-item.active {
	// 			background-color: #f0f2f5;
	// 		}
	// 		.chat-content {
	// 			width: 70%;
	// 			display: flex;
	// 			flex-direction: column;
	// 		}
	// 		.chat-header {
	// 			padding: 10px 15px;
	// 			background-color: #f0f2f5;
	// 			border-bottom: 1px solid #d1d7db;
	// 			color: #111b21; /* WhatsApp dark text */
	// 		}
	// 		.chat-messages {
	// 			flex: 1;
	// 			overflow-y: auto;
	// 			padding: 15px;
	// 			background-color: #efeae2; /* WhatsApp chat background */
	// 			background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23aaaaaa' fill-opacity='0.1'/%3E%3C/svg%3E");
	// 		}
	// 		.message {
	// 			max-width: 30%;
	// 			padding: 8px 12px;
	// 			margin-bottom: 10px;
	// 			border-radius: 7.5px;
	// 			position: relative;
	// 			word-wrap: break-word;
	// 			color: #111b21; /* WhatsApp dark text */
	// 			box-shadow: 0 1px 0.5px rgba(0,0,0,0.13);
	// 			line-height: 1.4;
	// 		}
	// 		.message.incoming {
	// 			background-color: #ffffff;
	// 			align-self: flex-start;
	// 			margin-right: auto;
	// 			border-top-left-radius: 0;
	// 		}
	// 		.message.outgoing {
	// 			background-color: #d9fdd3; /* WhatsApp green message bubble */
	// 			align-self: flex-end;
	// 			margin-left: auto;
	// 			border-top-right-radius: 0;
	// 		}
	// 		.chat-input-container {
	// 			padding: 10px;
	// 			background-color: #f0f2f5;
	// 			display: flex;
	// 			flex-direction: column;
	// 			border-top: 1px solid #d1d7db;
	// 		}
	// 		#message-input {
	// 			resize: none;
	// 			border-radius: 20px;
	// 			padding: 9px 12px;
	// 			margin-bottom: 10px;
	// 			height: 45px;
	// 			border: 1px solid #d1d7db;
	// 			color: #111b21; /* WhatsApp dark text */
	// 			background-color: #f0f2f5;
	// 		}
	// 		.chat-actions {
	// 			display: flex;
	// 			justify-content: space-between;
	// 		}
	// 		.btn-primary {
	// 			background-color: #00a884; /* WhatsApp green */
	// 			border-color: #00a884;
	// 			color: white;
	// 		}
	// 		.btn-default {
	// 			background-color: #f0f2f5;
	// 			border-color: #d1d7db;
	// 			color: #54656f;
	// 		}
	// 		.message-time {
	// 			font-size: 11px;
	// 			color: #667781; /* WhatsApp time text color */
	// 			text-align: right;
	// 			margin-top: 2px;
	// 		}
	// 		.message-status {
	// 			font-size: 11px;
	// 			color: #667781; /* WhatsApp status text color */
	// 			margin-left: 5px;
	// 		}

	// 		@media (max-width: 767px) {
	// 			.chat-container {
	// 				flex-direction: column;
	// 			}
				
	// 			.chat-sidebar {
	// 				width: 100%;
	// 				height: 30%;
	// 			}
				
	// 			.chat-content {
	// 				width: 100%;
	// 				height: 70%;
	// 			}

	// 			.message {
	// 				max-width: 75%;
	// 			}
	// 		}
    //     `).appendTo('head');
    // }

	add_styles() {
		// Add CSS for the chat interface
		$('<style>').text(`
			.chat-container {
				display: flex;
				height: calc(100vh - 170px);
				background-color: #111b21; /* Dark background */
			}
			.chat-sidebar {
				width: 30%;
				border-right: 1px solid #38424a; /* Darker border */
				display: flex;
				flex-direction: column;
				background-color: #181d20; /* Dark sidebar background */
			}
			.chat-search {
				padding: 10px;
				border-bottom: 1px solid #38424a; /* Darker border */
			}
			.chat-search input {
				background-color: #202c33; /* Dark input background */
				border-radius: 18px;
				border: none;
				padding: 8px 12px;
				color: #ffffff; /* White text for better visibility */
				width: 100%;
			}
			.contact-list {
				flex: 1;
				overflow-y: auto;
			}
			.contact-item {
				padding: 12px 15px;
				border-bottom: 1px solid #38424a; /* Darker border */
				cursor: pointer;
				color: #ffffff; /* White text for better visibility */
				font-weight: 400;
			}
			.contact-item:hover {
				background-color: #2a3942; /* Slightly lighter hover effect */
			}
			.contact-item.active {
				background-color: #202c33; /* Darker active item background */
			}
			.chat-content {
				width: 70%;
				display: flex;
				flex-direction: column;
			}
			.chat-header {
				padding: 10px 15px;
				background-color: #202c33; /* Dark header background */
				border-bottom: 1px solid #38424a; /* Darker border */
				color: #ffffff; /* White text for better visibility */
				height: 65px;
				display: flex;
    			align-items: center; /* Vertically centers the content */
			}
			.chat-messages {
				flex: 1;
				overflow-y: auto;
				padding: 15px;
				background-color: #111b21; /* Dark chat background */
				background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23444444' fill-opacity='0.1'/%3E%3C/svg%3E");
			}
			.message {
				max-width: 30%;
				padding: 8px 12px;
				margin-bottom: 10px;
				border-radius: 7.5px;
				position: relative;
				word-wrap: break-word;
				color: #ffffff; /* White text for better visibility */
				box-shadow: 0 1px 0.5px rgba(0,0,0,0.13);
				line-height: 1.4;
			}
			.message.incoming {
				background-color: #202c33; /* Dark incoming message bubble */
				align-self: flex-start;
				margin-right: auto;
				border-top-left-radius: 0;
			}
			.message.outgoing {
				background-color: #005C4B; /* WhatsApp green message bubble (kept as-is) */
				align-self: flex-end;
				margin-left: auto;
				border-top-right-radius: 0;
			}
			.chat-input-container {
				padding: 10px;
				background-color: #181d20; /* Dark input container background */
				display: flex;
				flex-direction: column;
				border-top: 1px solid #38424a; /* Darker border */
			}
			#message-input {
				resize: none;
				border-radius: 20px;
				padding: 9px 12px;
				margin-bottom: 10px;
				height: 45px;
				border: 1px solid #38424a; /* Darker border */
				color: #ffffff; /* White text for better visibility */
				background-color: #202c33; /* Dark input background */
			}
			.chat-actions {
				display: flex;
				justify-content: space-between;
			}
			.btn-primary {
				background-color: #00a884; /* WhatsApp green */
				border-color: #00a884;
				color: white;
			}
			.btn-default {
				background-color: #181d20; /* Dark button background */
				border-color: #38424a; /* Darker border */
				color: #ffffff; /* White text for better visibility */
			}
			.message-time {
				font-size: 11px;
				color: #8696a0; /* Light gray time text */
				text-align: right;
				margin-top: 2px;
			}
			.message-status {
				font-size: 11px;
				color: #8696a0; /* Light gray status text */
				margin-left: 5px;
			}
	
			@media (max-width: 767px) {
				.chat-container {
					flex-direction: column;
				}
				
				.chat-sidebar {
					width: 100%;
					height: 30%;
				}
				
				.chat-content {
					width: 100%;
					height: 70%;
				}
	
				.message {
					max-width: 75%;
				}
			}
		`).appendTo('head');
	}

    
    setup_events() {
        const me = this;
        
        // Event for searching contacts
        $('#contact-search').on('input', function() {
            const searchText = $(this).val().toLowerCase();
            $('.contact-item').each(function() {
                const contactName = $(this).find('.contact-name').text().toLowerCase();
                const contactNumber = $(this).find('.contact-number').text().toLowerCase();
                if (contactName.includes(searchText) || contactNumber.includes(searchText)) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        });
        
        // Event for sending messages
        $('.btn-send').on('click', function() {
            me.send_message();
        });
        
        // Event for using templates
        $('.btn-use-template').on('click', function() {
            me.show_template_dialog();
        });
        
        // Enter key to send message
        $('#message-input').on('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                me.send_message();
            }
        });
    }
    
	load_contacts() {
		const me = this;
		
		// First, try to get all unique contacts directly
		frappe.call({
			method: 'frappe.client.get_list',
			args: {
				doctype: 'WhatsApp Message',
				fields: ['distinct `to` as contact'],
				limit: 1000
			},
			callback: function(toResponse) {
				frappe.call({
					method: 'frappe.client.get_list',
					args: {
						doctype: 'WhatsApp Message',
						fields: ['distinct `from` as contact'],
						limit: 1000
					},
					callback: function(fromResponse) {
						console.log("To contacts:", toResponse.message ? toResponse.message.length : 0);
						console.log("From contacts:", fromResponse.message ? fromResponse.message.length : 0);
						
						// Combine and deduplicate contacts
						let allContacts = [];
						
						if (toResponse.message) {
							allContacts = [...toResponse.message.map(c => c.contact).filter(Boolean)];
						}
						
						if (fromResponse.message) {
							allContacts = [...allContacts, ...fromResponse.message.map(c => c.contact).filter(Boolean)];
						}
						
						// Remove duplicates
						const uniqueContacts = [...new Set(allContacts)];
						console.log(`Found ${uniqueContacts.length} unique phone numbers`);
						
						// Now fetch profile names for these contacts
						me.fetch_contact_details(uniqueContacts);
					}
				});
			}
		});
	}
	
	fetch_contact_details(phoneNumbers) {
		if (!phoneNumbers.length) {
			$('.contact-list').html('<div class="text-muted p-4">No contacts found</div>');
			return;
		}
		
		const me = this;
		const contacts = [];
		let processed = 0;
		
		// Process contacts in smaller batches to avoid timeouts/limits
		const batchSize = 20;
		const totalBatches = Math.ceil(phoneNumbers.length / batchSize);
		let currentBatch = 0;
		
		function processBatch() {
			if (currentBatch >= totalBatches) {
				// All batches processed, render contacts
				console.log(`Completed processing ${contacts.length} contacts`);
				me.render_contacts(contacts);
				return;
			}
			
			const start = currentBatch * batchSize;
			const end = Math.min(start + batchSize, phoneNumbers.length);
			const batch = phoneNumbers.slice(start, end);
			
			console.log(`Processing batch ${currentBatch + 1}/${totalBatches}: ${batch.length} contacts`);
			
			Promise.all(batch.map(phoneNumber => {
				return new Promise(resolve => {
					// Get the most recent message for this contact to extract profile name
					frappe.call({
						method: 'frappe.client.get_list',
						args: {
							doctype: 'WhatsApp Message',
							filters: [
								['to', '=', phoneNumber],
								['profile_name', '!=', '']
							],
							fields: ['profile_name'],
							limit: 1,
							order_by: 'modified desc'
						},
						callback: function(toRes) {
							if (toRes.message && toRes.message.length > 0 && toRes.message[0].profile_name) {
								contacts.push({
									number: phoneNumber,
									name: toRes.message[0].profile_name,
									direction: 'outgoing'
								});
								resolve();
							} else {
								// Try from the 'from' field if not found in 'to'
								frappe.call({
									method: 'frappe.client.get_list',
									args: {
										doctype: 'WhatsApp Message',
										filters: [
											['from', '=', phoneNumber],
											['profile_name', '!=', '']
										],
										fields: ['profile_name'],
										limit: 1,
										order_by: 'modified desc'
									},
									callback: function(fromRes) {
										if (fromRes.message && fromRes.message.length > 0 && fromRes.message[0].profile_name) {
											contacts.push({
												number: phoneNumber,
												name: fromRes.message[0].profile_name,
												direction: 'incoming'
											});
										} else {
											// No profile name found, use the number as name
											contacts.push({
												number: phoneNumber,
												name: 'Unknown',
												direction: 'unknown'
											});
										}
										resolve();
									}
								});
							}
						}
					});
				});
			})).then(() => {
				currentBatch++;
				processBatch(); // Process next batch
			});
		}
		
		// Start processing batches
		processBatch();
	}
	
	render_contacts(contacts) {
		const contactList = $('.contact-list');
		contactList.empty();
		
		if (contacts.length === 0) {
			contactList.append(`<div class="text-muted p-4">No contacts found</div>`);
			return;
		}
		
		console.log(`Rendering ${contacts.length} contacts`);
		
		// Sort contacts alphabetically by name
		contacts.sort((a, b) => {
			return a.name.localeCompare(b.name);
		});
		
		const me = this;
		contacts.forEach(contact => {
			// Enhanced contact item with better styling
			const formatPhoneNumber = (number) => {
				// Ensure the number is a string
				number = number.toString();			
				const countryCode = number.slice(0, 2);			
				const firstPart = number.slice(2, 7);			
				const secondPart = number.slice(7, 12);			
				return `+${countryCode} ${firstPart} ${secondPart}`;
			};
			
			const contactItem = $(`
				<div class="contact-item" data-number="${contact.number}">
					<div class="contact-avatar">
						${contact.name ? contact.name.charAt(0).toUpperCase() : '#'}
					</div>
					<div class="contact-info">
						<div class="contact-name">${contact.name || 'Unknown'}</div>
						<div class="contact-number">${formatPhoneNumber(contact.number)}</div>
					</div>
				</div>
			`);
			
			contactItem.on('click', function() {
				$('.contact-item').removeClass('active');
				$(this).addClass('active');
				me.load_messages(contact.number);
			});
			
			contactList.append(contactItem);
		});
		
		// Add styles for new contact design
		if (!$('#contact-custom-styles').length) {
			$('<style id="contact-custom-styles">').text(`
				.contact-item {
					display: flex;
					align-items: center;
					padding: 12px 15px;
					cursor: pointer;
				}
				.contact-avatar {
					width: 40px;
					height: 40px;
					border-radius: 50%;
					background-color: #6A7175;
					color: white;
					display: flex;
					align-items: center;
					justify-content: center;
					font-weight: bold;
					margin-right: 15px;
					flex-shrink: 0;
					color: #ffffff;
				}
				.contact-info {
					flex: 1;
					overflow: hidden;
				}
				.contact-name {
					font-weight: 500;
					color: #ffffff;
					margin-bottom: 3px;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
				.contact-number {
					font-size: 0.85rem;
					color: #667781;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
				.contact-search {
					position: relative;
				}
				.contact-search input {
					width: 100%;
					padding: 8px 10px;
					padding-left: 35px;
					border-radius: 8px;
					border: 1px solid #d1d7db;
					background-color: #f0f2f5;
				}
				.contact-search:before {
					content: "🔍";
					position: absolute;
					left: 12px;
					top: 50%;
					transform: translateY(-50%);
					color: #8696a0;
				}
			`).appendTo('head');
		}
		
		// Add search functionality
		$('#contact-search').off('input').on('input', function() {
			const searchTerm = $(this).val().toLowerCase();
			
			$('.contact-item').each(function() {
				const name = $(this).find('.contact-name').text().toLowerCase();
				const number = $(this).find('.contact-number').text().toLowerCase();
				
				if (name.includes(searchTerm) || number.includes(searchTerm)) {
					$(this).show();
				} else {
					$(this).hide();
				}
			});
		});
		
		// Select the first contact by default
		if (contacts.length > 0) {
			$('.contact-item').first().trigger('click');
		}
	}
		
	load_messages(phoneNumber) {
		const me = this;
		this.current_contact = phoneNumber;
	
		const formatPhoneNumber = (number) => {
			// Ensure the number is a string
			number = number.toString();
			const countryCode = number.slice(0, 2);
			const firstPart = number.slice(2, 7);
			const secondPart = number.slice(7, 12);
			return `+${countryCode} ${firstPart} ${secondPart}`;
		};
	
		// Fetch contact details using your existing fetch_contact_details function
		const fetchContactName = (phoneNumber) => {
			return new Promise((resolve, reject) => {
				frappe.call({
					method: 'frappe.client.get_list',
					args: {
						doctype: 'WhatsApp Message',
						filters: [
							['to', '=', phoneNumber],
							['profile_name', '!=', '']
						],
						fields: ['profile_name'],
						limit: 1,
						order_by: 'modified desc'
					},
					callback: function(toRes) {
						if (toRes.message && toRes.message.length > 0 && toRes.message[0].profile_name) {
							resolve(toRes.message[0].profile_name); // Resolve with profile name
						} else {
							// Try fetching from the 'from' field if not found in 'to'
							frappe.call({
								method: 'frappe.client.get_list',
								args: {
									doctype: 'WhatsApp Message',
									filters: [
										['from', '=', phoneNumber],
										['profile_name', '!=', '']
									],
									fields: ['profile_name'],
									limit: 1,
									order_by: 'modified desc'
								},
								callback: function(fromRes) {
									if (fromRes.message && fromRes.message.length > 0 && fromRes.message[0].profile_name) {
										resolve(fromRes.message[0].profile_name); // Resolve with profile name
									} else {
										resolve('Unknown'); // Default to "Unknown" if no profile name is found
									}
								}
							});
						}
					}
				});
			});
		};
	
		// Fetch the contact name
		fetchContactName(phoneNumber).then(contactName => {
			// Update the header with both name and formatted phone number
			$('.current-contact').html(`
				<strong>${contactName}</strong><br>
				<small>${formatPhoneNumber(phoneNumber)}</small>
			`);
	
			// Fetch messages where "to" or "from" matches phoneNumber
			Promise.all([
				frappe.call({
					method: 'frappe.client.get_list',
					args: {
						doctype: 'WhatsApp Message',
						filters: { to: phoneNumber },
						fields: ['name', 'to', 'from', 'message', 'type', 'status', 'content_type', 'attach', 'creation'],
						limit: 1000
					}
				}),
				frappe.call({
					method: 'frappe.client.get_list',
					args: {
						doctype: 'WhatsApp Message',
						filters: { from: phoneNumber },
						fields: ['name', 'to', 'from', 'message', 'type', 'status', 'content_type', 'attach', 'creation'],
						limit: 1000
					}
				})
			]).then(([toRes, fromRes]) => {
				// Merge and sort messages by creation date
				const allMessages = [...toRes.message, ...fromRes.message];
				allMessages.sort((a, b) => new Date(a.creation) - new Date(b.creation));
	
				if (allMessages.length > 0) {
					me.render_messages(allMessages, phoneNumber);
				} else {
					frappe.msgprint({
						title: __("No Messages Found"),
						message: __("There are no messages for this contact."),
						indicator: "orange"
					});
				}
			}).catch(err => {
				console.error("❌ Failed to load messages:", err);
				frappe.msgprint({
					title: __("Error"),
					message: __("Failed to load messages. Please check console for details."),
					indicator: "red"
				});
			});
		}).catch(err => {
			console.error("❌ Failed to fetch contact name:", err);
			// Fallback: Update the header with only the formatted phone number
			$('.current-contact').html(`
				<strong>Unknown</strong><br>
				<small>${formatPhoneNumber(phoneNumber)}</small>
			`);
		});
	}

    
    render_messages(messages, phoneNumber) {
        const messagesContainer = $('.chat-messages');
        messagesContainer.empty();
        
        messages.forEach(msg => {
            let isOutgoing = msg.to === phoneNumber;
            let messageClass = isOutgoing ? 'outgoing' : 'incoming';
            let messageContent = msg.message || '';
            
            // Handle different content types
            if (msg.content_type === 'image' && msg.attach) {
                messageContent = `<img src="${msg.attach}" style="max-width: 100%; height: auto;" />`;
            } else if ((msg.content_type === 'document' || msg.content_type === 'audio' || msg.content_type === 'video') && msg.attach) {
                messageContent = `<a href="${msg.attach}" target="_blank">Download ${msg.content_type}</a>`;
            }
            
            const messageItem = $(`
                <div class="message ${messageClass}" data-name="${msg.name}">
                    <div class="message-content">${messageContent}</div>
                    <div class="message-meta" style="text-align: right">
						<span class="message-time">
							${frappe.datetime.str_to_user(msg.creation).replace(/:\d{2}$/, '')}
						</span>
						${isOutgoing ? `<span class="message-status">${msg.status || 'sent'}</span>` : ''}
					</div>
                </div>
            `);
            
            messagesContainer.append(messageItem);
        });
        
        // Scroll to bottom
        messagesContainer.scrollTop(messagesContainer[0].scrollHeight);
    }
    
    send_message() {
        const messageInput = $('#message-input');
        const message = messageInput.val().trim();
        
        if (!message || !this.current_contact) return;
        
        const me = this;
        frappe.call({
            method: 'frappe.client.insert',
            args: {
                doc: {
                    doctype: 'WhatsApp Message',
                    type: 'Outgoing',
                    to: this.current_contact,
                    message: message,
                    content_type: 'text',
                    status: 'queued'
                }
            },
            callback: function(r) {
                if (r.message) {
                    messageInput.val('');
                    me.load_messages(me.current_contact);
                }
            }
        });
    }
    
    show_template_dialog() {
        const me = this;
        
        frappe.call({
            method: 'frappe.client.get_list',
            args: {
                doctype: 'WhatsApp Templates',
                fields: ['name', 'template_name'],
                limit: 1000
            },
            callback: function(r) {
                if (r.message) {
                    let d = new frappe.ui.Dialog({
                        title: 'Send Template Message',
                        fields: [
                            {
                                label: 'Template',
                                fieldname: 'template',
                                fieldtype: 'Link',
                                options: 'WhatsApp Templates',
                                reqd: 1
                            },
                            {
                                label: 'Parameters',
                                fieldname: 'parameters',
                                fieldtype: 'Small Text',
                                description: 'Add parameters in JSON format: {"1":"value1","2":"value2"}'
                            }
                        ],
                        primary_action_label: 'Send',
                        primary_action(values) {
                            me.send_template_message(values);
                            d.hide();
                        }
                    });
                    d.show();
                }
            }
        });
    }
    
    send_template_message(values) {
        if (!this.current_contact) return;
        
        const me = this;
        frappe.call({
            method: 'frappe.client.insert',
            args: {
                doc: {
                    doctype: 'WhatsApp Message',
                    type: 'Outgoing',
                    to: this.current_contact,
                    use_template: 1,
                    template: values.template,
                    template_parameters: values.parameters,
                    content_type: 'text',
                    message_type: 'Template',
                    status: 'queued'
                }
            },
            callback: function(r) {
                if (r.message) {
                    me.load_messages(me.current_contact);
                }
            }
        });
    }
}