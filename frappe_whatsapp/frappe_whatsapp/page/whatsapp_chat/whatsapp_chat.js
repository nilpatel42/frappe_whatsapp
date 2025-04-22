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
        
	add_styles() {
		// Add CSS for the chat interface
		$('<style>').text(`
			.chat-send-wrapper {
				position: relative;
				width: 100%;
				display: flex;
				align-items: center;
			}
	
			.send-icon-btn {
				position: absolute;
				right: 50px;
				top: 50%;
				transform: translateY(-50%);
				background-color: transparent;
				border: none;
				width: 36px;
				height: 36px;
				display: flex;
				align-items: center;
				justify-content: center;
				cursor: pointer;
				color: #ffffff;
				font-size: 18px;
				margin-top: 0px;
			}
			.send-icon-btn:hover {
				color: rgb(94, 173, 156);
			}           
			.template-icon-btn {
				position: absolute;
				right: 4px;
				top: 50%;
				transform: translateY(-50%);
				background-color: transparent;
				border: none;
				width: 36px;
				height: 36px;
				display: flex;
				align-items: center;
				justify-content: center;
				cursor: pointer;
				color: #ffffff;
				font-size: 18px;
				margin-top: 0px;
			}
			.template-icon-btn:hover {
				color:rgb(94, 173, 156);
			}
			.chat-container {
				display: flex;
				height: calc(100vh - 170px);
				background-color: #111b21;
			}
			.chat-sidebar {
				width: 30%;
				border-right: 1px solid #38424a;
				display: flex;
				flex-direction: column;
				background-color: #181d20;
			}
			.chat-search {
				padding: 10px;
				border-bottom: 1px solid #38424a;
			}
			.chat-search input {
				background-color: #202c33;
				border-radius: 18px;
				border: none;
				padding: 8px 12px;
				color: #ffffff;
				width: 100%;
			}
			.contact-list {
				flex: 1;
				overflow-y: auto;
			}
			.contact-item {
				padding: 12px 15px;
				border-bottom: 1px solid #38424a;
				cursor: pointer;
				color: #ffffff;
				font-weight: 400;
			}
			.contact-item:hover {
				background-color: #2a3942;
			}
			.contact-item.active {
				background-color: #202c33;
			}
			.chat-content {
				width: 70%;
				display: flex;
				flex-direction: column;
			}
			.chat-header {
				padding: 10px 15px;
				background-color: #202c33;
				border-bottom: 1px solid #38424a;
				color: #ffffff;
				height: 65px;
				display: flex;
				align-items: center;
			}
			.chat-messages {
				flex: 1;
				overflow-y: auto;
				padding: 15px;
				background-color: #111b21;
				background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23444444' fill-opacity='0.1'/%3E%3C/svg%3E");
			}
			.message {
				max-width: 30%;
				margin-bottom: 5px;
				border-radius: 7.5px;
				position: relative;
				word-wrap: break-word;
				color: #ffffff;
				box-shadow: 0 1px 0.5px rgba(0,0,0,0.13);
				line-height: 1.4;
			}
			.message.incoming {
				background-color: #202c33;
				align-self: flex-start;
				margin-right: auto;
				padding: 8px 10px 7px;
				border-top-left-radius: 0;
			}
			.message.outgoing {
				background-color: #005C4B;
				align-self: flex-end;
				margin-left: auto;
				padding: 8px 10px 3px;
				border-top-right-radius: 0;
			}
			.chat-input-container {
				padding: 10px;
				background-color: #181d20;
				display: flex;
				flex-direction: column;
				border-top: 1px solid #38424a;
			}
			#message-input {
				resize: none;
				border-radius: 10px;
				padding: 9px 12px;
				height: 45px;
				border: 1px solid #38424a;
				color: #ffffff;
				background-color: #202c33;
				width: 96%;
				padding-right: 40px;
			}
			.btn-primary {
				background-color: #00a884;
				border-color: #00a884;
				color: white;
			}
			.btn-default {
				background-color: #181d20;
				border-color: #38424a;
				color: #ffffff;
			}
			.message-time {
				font-size: 11px;
				color: #8696a0;
				text-align: right;
				margin-top: 2px;
				margin-right: 10px;
			}
			.message-status {
				font-size: 11px;
				color: #8696a0;
				margin-left: -5px;
				margin-right: -5px;
				margin-bottom: 15px;
			}
	
			/* Mobile view styles with toggler */
			@media (max-width: 767px) {
				.chat-container {
					position: relative;
					height: calc(100vh - 170px);
					overflow: hidden;
				}
				
				.chat-sidebar {
					width: 100%;
					height: 100%;
					position: absolute;
					top: 0;
					left: 0;
					z-index: 10;
					transform: translateX(0);
					transition: transform 0.3s ease;
					visibility: visible;
					overflow: hidden;
				}
				
				.chat-content {
					width: 100%;
					height: 100%;
					position: absolute;
					top: 0;
					left: 0;
					z-index: 5;
				}
				
				.sidebar-hidden {
					transform: translateX(-100%);
					visibility: hidden;
					width: 0;
					overflow: hidden;
				}
				
				.back-to-contacts-btn {
					margin-right: 10px;
					background-color: transparent;
					border: none;
					color: #ffffff;
					font-size: 20px;
					cursor: pointer;
					display: flex;
					align-items: center;
					justify-content: center;
					width: 36px;
					height: 36px;
				}
	
				.message {
					max-width: 75%;
				}
	
				#message-input {
					width: 87%;
					padding-right: 80px;
				}
				
				.send-icon-btn {
					margin-top: 0px;
					margin-right: 4px;
				}
	
				.template-icon-btn {
					margin-top: 0px;
				}
			}
		`).appendTo('head');
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
						<button class="back-to-contacts-btn" style="display: none;">
							<i class="fa fa-arrow-left" aria-hidden="true"></i>
						</button>
						<div class="current-contact-avatar contact-avatar"></div>
						<div class="current-contact"></div>
					</div>
					<div class="chat-messages"></div>
					<div class="chat-input-container">
						<div class="chat-send-wrapper">
							<textarea id="message-input" placeholder="Type a message"></textarea>
							<button id="send-button" class="send-icon-btn btn-send" style="display: none;">
								<i class="fa fa-paper-plane" aria-hidden="true"></i>
							</button>
							<button class="template-icon-btn btn-use-template">
								<i class="fa fa-book" aria-hidden="true"></i>
							</button>                        
						</div>
					</div>
				</div>
			</div>
		`);
		
		this.add_styles();
		this.setup_events();
		this.setup_mobile_toggler();
	}
	
	setup_mobile_toggler() {
		// Check if we're on mobile
		const isMobile = window.innerWidth <= 767;
		
		if (isMobile) {
			// Initially show the sidebar and hide the chat content
			$('.back-to-contacts-btn').show();
			
			// Setup back button in header to return to contacts
			$('.back-to-contacts-btn').on('click', function() {
				$('.chat-sidebar').removeClass('sidebar-hidden');
			});
			
			// When a contact is clicked, show chat content and hide sidebar
			$(document).on('click', '.contact-item', function() {
				$('.chat-sidebar').addClass('sidebar-hidden');
			});
		}
		
		// Handle resize events
		$(window).on('resize', function() {
			const currentIsMobile = window.innerWidth <= 767;
			
			if (currentIsMobile) {
				// We're on mobile now
				if (!$('.back-to-contacts-btn').is(':visible')) {
					$('.back-to-contacts-btn').show();
					
					// If we're switching to mobile, reset the view to show contacts
					if (!$('.chat-sidebar').hasClass('sidebar-hidden')) {
						$('.chat-sidebar').removeClass('sidebar-hidden');
					}
				}
			} else {
				// We're on desktop now
				$('.back-to-contacts-btn').hide();
				$('.chat-sidebar').removeClass('sidebar-hidden');
			}
		});
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
    
    setup_events() {

		const messageInput = document.getElementById('message-input');
		const sendButton = document.getElementById('send-button');

		messageInput.addEventListener('input', () => {
			if (messageInput.value.trim() !== "") {
				sendButton.style.display = 'inline-block'; // or 'flex' if needed
			} else {
				sendButton.style.display = 'none';
			}
		});
		
        const me = this;
		$(document).on('click', '.contact-item', function() {
			const contactName = $(this).text();
			$('.current-contact').text(contactName);
			$('.contact-item').removeClass('active');
			$(this).addClass('active');
			
			// Clear and load messages for this contact
			$('.chat-messages').empty();
			// Load messages logic here...
		});
        
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

			const formatPhoneNumber = (number) => {
				// Ensure the number is a string
				number = number.toString();            
				const countryCode = number.slice(0, 2);            
				const firstPart = number.slice(2, 7);            
				const secondPart = number.slice(7, 12);            
				return `+${countryCode} ${firstPart} ${secondPart}`;
			};
			
			const start = currentBatch * batchSize;
			const end = Math.min(start + batchSize, phoneNumbers.length);
			const batch = phoneNumbers.slice(start, end);
			
			console.log(`Processing batch ${currentBatch + 1}/${totalBatches}: ${batch.length} contacts`);
			
			Promise.all(batch.map(phoneNumber => {
				return new Promise(resolve => {
					// Get both profile name and last message info
					Promise.all([
						// Get profile name
						new Promise(resolveProfile => {
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
										resolveProfile({
											name: toRes.message[0].profile_name,
											direction: 'outgoing'
										});
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
													resolveProfile({
														name: fromRes.message[0].profile_name,
														direction: 'incoming'
													});
												} else {
													// No profile name found, use the number as name
													resolveProfile({
														name: formatPhoneNumber(phoneNumber),
														direction: 'unknown'
													});
												}
											}
										});
									}
								}
							});
						}),
						
						// Get last message
						new Promise(resolveLastMsg => {
							frappe.call({
								method: 'frappe.client.get_list',
								args: {
									doctype: 'WhatsApp Message',
									filters: [
										['to', '=', phoneNumber],
										['message', '!=', '']
									],
									fields: ['message', 'creation', 'content_type'],
									limit: 1,
									order_by: 'creation desc'
								},
								callback: function(toMsgRes) {
									frappe.call({
										method: 'frappe.client.get_list',
										args: {
											doctype: 'WhatsApp Message',
											filters: [
												['from', '=', phoneNumber],
												['message', '!=', '']
											],
											fields: ['message', 'creation', 'content_type'],
											limit: 1,
											order_by: 'creation desc'
										},
										callback: function(fromMsgRes) {
											let outgoingMsg = toMsgRes.message && toMsgRes.message[0];
											let incomingMsg = fromMsgRes.message && fromMsgRes.message[0];
											
											// Determine which message is more recent
											let lastMsg;
											if (outgoingMsg && incomingMsg) {
												lastMsg = new Date(outgoingMsg.creation) > new Date(incomingMsg.creation) ? 
													{...outgoingMsg, isOutgoing: true} : 
													{...incomingMsg, isOutgoing: false};
											} else if (outgoingMsg) {
												lastMsg = {...outgoingMsg, isOutgoing: true};
											} else if (incomingMsg) {
												lastMsg = {...incomingMsg, isOutgoing: false};
											} else {
												lastMsg = null;
											}
											
											resolveLastMsg(lastMsg);
										}
									});
								}
							});
						})
					]).then(([profileInfo, lastMessage]) => {
						contacts.push({
							number: phoneNumber,
							name: profileInfo.name,
							direction: profileInfo.direction,
							lastMessage: lastMessage
						});
						resolve();
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
		
		// Sort contacts by last message time (most recent first)
		contacts.sort((a, b) => {
			if (!a.lastMessage && !b.lastMessage) return 0;
			if (!a.lastMessage) return 1;
			if (!b.lastMessage) return -1;
			return new Date(b.lastMessage.creation) - new Date(a.lastMessage.creation);
		});
		
		const me = this;
		contacts.forEach(contact => {
			// Format the last message time in WhatsApp style
			const formatLastMessageTime = (dateString) => {
				if (!dateString) return '';
			
				const messageDate = new Date(dateString);
				const today = new Date();
				const yesterday = new Date(today);
				yesterday.setDate(yesterday.getDate() - 1);
			
				// Check if the message is from today
				if (messageDate.toDateString() === today.toDateString()) {
					return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
				}
				// Check if the message is from yesterday
				else if (messageDate.toDateString() === yesterday.toDateString()) {
					return 'Yesterday';
				}
				// If within the last week, show day name
				else if ((today - messageDate) / (1000 * 60 * 60 * 24) < 7) {
					return messageDate.toLocaleDateString([], { weekday: 'short' });
				}
				// Otherwise show date in DD/MM/YY format
				else {
					const day = String(messageDate.getDate()).padStart(2, '0'); // Ensure two digits for day
					const month = String(messageDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
					const year = String(messageDate.getFullYear()).slice(-2); // Get last two digits of the year
			
					return `${day}/${month}/${year}`;
				}
			};
			
			// Get a preview of the last message
			const getMessagePreview = (msg) => {
				if (!msg) return '';
				
				if (msg.content_type === 'image') {
					return '📷 Photo';
				} else if (msg.content_type === 'document') {
					return '📎 Document';
				} else if (msg.content_type === 'audio') {
					return '🎵 Audio';
				} else if (msg.content_type === 'video') {
					return '🎬 Video';
				} else {
					// Truncate text messages if too long
					const maxLength = 35;
					let preview = msg.message || '';
					preview = preview.replace(/\n/g, ' ');
					return preview.length > maxLength ? preview.substring(0, maxLength) + '...' : preview;
				}
			};
					
			// Generate last message direction icon
			const directionIcon = contact.lastMessage?.isOutgoing 
				? '<span class="fa-stack fa-sm text-primary">' +
					'<i class="fa fa-check fa-stack-1x" style="margin-left: -5px; color: #53BDEB;"></i>' +
					'<i class="fa fa-check fa-stack-1x" style="color: #53BDEB; margin-left: -1px;"></i>' +
				'</span>' 
				: '';
			
			const contactItem = $(`
				<div class="contact-item" data-number="${contact.number}">
					<div class="contact-avatar">
						${contact.name && contact.name.charAt(0) !== '+' 
							? contact.name.charAt(0).toUpperCase() 
							: 'U'}
					</div>
					<div class="contact-info">
						<div class="contact-header">
							<div class="contact-name">${contact.name}</div>
							<div class="contact-time">${contact.lastMessage ? formatLastMessageTime(contact.lastMessage.creation) : ''}</div>
						</div>
						<div class="contact-message">
							${directionIcon}${getMessagePreview(contact.lastMessage)}
						</div>
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
					border-bottom: 1px solid #1f2c33;
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
				.contact-header {
					display: flex;
					justify-content: space-between;
					margin-bottom: 3px;
				}
				.contact-name {
					font-weight: 500;
					color: #ffffff;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
				.contact-time {
					font-size: 0.75rem;
					color: #8696a0;
					white-space: nowrap;
					margin-left: 10px;
					flex-shrink: 0;
				}
				.contact-message {
					font-size: 0.85rem;
					color: #8696a0;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					display: flex;
					align-items: center;
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

			$('.current-contact-avatar').html(`${contactName ? contactName.charAt(0).toUpperCase() : '#'}`);
			$('.current-contact').html(`
				<strong>${contactName}</strong><br>
				<small>${formatPhoneNumber(phoneNumber)}</small>
			`);
	
			// Fetch messages where "to" or "from" matches phoneNumber
			Promise.all([
				frappe.db.get_list('WhatsApp Message', {
					filters: { to: phoneNumber },
					fields: ['name', 'to', 'message', 'type', 'status', 'content_type', 'attach', 'creation'],
					limit_page_length: 20
				}),
				frappe.db.get_list('WhatsApp Message', {
					filters: { from: phoneNumber },
					fields: ['name', 'from', 'message', 'type', 'status', 'content_type', 'attach', 'creation'],
					limit_page_length: 20
				})
			]).then(([toMessages, fromMessages]) => {
				// Merge and sort messages by creation date
				const allMessages = [...toMessages, ...fromMessages];
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
		
		let currentDate = null;
		
		messages.forEach((msg, index) => {
			const messageDate = new Date(msg.creation);
			const formattedDate = formatMessageDate(messageDate);
			
			// Add date separator if this is a new date
			if (formattedDate !== currentDate) {
				currentDate = formattedDate;
				
				const dateSeparator = $(`
					<div class="date-separator">
						<div class="date-bubble">${currentDate}</div>
					</div>
				`);
				
				messagesContainer.append(dateSeparator);
			}
			
			let isOutgoing = msg.from !== phoneNumber;
			let messageClass = isOutgoing ? 'outgoing' : 'incoming';
			let messageContent = msg.message || '';
			let formattedMessage = messageContent
				.replace(/\*/g, '**') // Optional: unify bold markers
				.replace(/\n/g, '<br>') // Convert newlines to <br>
				.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Convert *bold* to <b>bold</b>
				.replace(/_(.*?)_/g, '<i>$1</i>'); // Convert _italic_ to <i>italic</i>
			let wrappedTemplate = `<div style="white-space: pre-wrap;">${formattedMessage}</div>`;
			
			// Handle different content types
			if (msg.content_type === 'image' && msg.attach) {
				wrappedTemplate = `<img src="${msg.attach}" style="max-width: 100%; height: auto;" />`;
			} else if ((msg.content_type === 'document' || msg.content_type === 'audio' || msg.content_type === 'video') && msg.attach) {
				wrappedTemplate = `<a href="${msg.attach}" target="_blank" style="color: #53BDEB;">Click Here to Open ${msg.content_type}</a>`;
			}
			
			(function loadFontAwesome() {
				if (!document.getElementById('font-awesome')) {
					const link = document.createElement('link');
					link.id = 'font-awesome';
					link.rel = 'stylesheet';
					link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
					document.head.appendChild(link);
				}
			})();
			
			const getMessageStatusIcon = (status) => {
				if (status === 'sent') {
					return `
						<span class="fa-stack fa-sm text-muted">
							<i class="fa fa-check fa-stack-1x" style="margin-left: 2px; color: gray; margin-top: -2px;"></i>
						</span>`;
				}
				if (status === 'delivered') {
					return `
						<span class="fa-stack fa-sm text-muted">
							<i class="fa fa-check fa-stack-1x" style="margin-left: 4px; color: gray; margin-top: -2px;"></i>
							<i class="fa fa-check fa-stack-1x" style="color: gray; margin-top: -2px;"></i>
						</span>`;
				}
				if (status === 'read') {
					return `
						<span class="fa-stack fa-sm text-primary">
							<i class="fa fa-check fa-stack-1x" style="margin-left: 4px; color: #53BDEB; margin-top: -2px;p"></i>
							<i class="fa fa-check fa-stack-1x" style="color: #53BDEB; margin-top: -2px;"></i>
						</span>`;
				}
				return '';
			};
			
			// Format time in 12-hour format (WhatsApp style)
			const formatTime = (date) => {
				return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
			};
			
			const messageItem = $(`
				<div class="message ${messageClass}" data-name="${msg.name}">
					<div class="message-content">${wrappedTemplate}</div>
					<div class="message-meta" style="text-align: right; align-items: center;">
						<span class="message-time">
							${formatTime(messageDate)}
						</span>
						${isOutgoing ? `<span class="message-status">${getMessageStatusIcon(msg.status || 'sent')}</span>` : ''}
					</div>
				</div>
			`);
			
			messagesContainer.append(messageItem);
		});
		
		// Add style for date separators
		if (!$('#date-separator-styles').length) {
			$('<style id="date-separator-styles">').text(`
				.date-separator {
					text-align: center;
					margin: 10px 0;
					position: relative;
				}
				.date-bubble {
					background-color: #1f2c33;
					color: #8696a0;
					font-size: 0.75rem;
					padding: 5px 10px;
					border-radius: 8px;
					display: inline-block;
					text-transform: uppercase;
				}
			`).appendTo('head');
		}
		
		// Scroll to bottom
		messagesContainer.scrollTop(messagesContainer[0].scrollHeight);

		function formatMessageDate(date) {
			const today = new Date();
			const yesterday = new Date(today);
			yesterday.setDate(yesterday.getDate() - 1);
			
			// Check if the message is from today
			if (date.toDateString() === today.toDateString()) {
				return 'TODAY';
			}
			// Check if the message is from yesterday
			else if (date.toDateString() === yesterday.toDateString()) {
				return 'YESTERDAY';
			}
			// If within the last week, show day name
			else if ((today - date) / (1000 * 60 * 60 * 24) < 7) {
				const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
				return days[date.getDay()];
			}
			// Otherwise show date
			else {
				const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
				return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
			}
		}
		
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