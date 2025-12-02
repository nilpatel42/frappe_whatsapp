frappe.pages['whatsapp-chat'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'WhatsApp Chat',
        single_column: true
    });
    
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
                <input type="text" id="contact-search" placeholder="Find Contact or Number">
                <div style="display: inline-block;">
                    <button class="wc-dropdown" id="newDropdown" data-toggle="dropdown">
                        <i class="fa fa-comments-o" style=""></i>
                    </button>
                    <div class="dropdown-menu" aria-labelledby="newDropdown">
                        <a class="dropdown-item new-contact-btn" href="#">
                            <i class="fa fa-user-plus" style="margin-right: 10px;"></i>
                            New Contact
                        </a>
                        <a class="dropdown-item bulk-message-btn" href="#">
                            <i class="fa fa-users" style="margin-right: 10px;"></i>
                            Bulk Message
                        </a>
                    </div>
                </div>
            </div>

					<div class="contact-list"></div>
				</div>
				<div class="chat-content">
					<div class="chat-header">
						<div class="chat-header-left">
							<button class="back-to-contacts-btn" style="display: none;">
								<i class="fa fa-arrow-left" aria-hidden="true"></i>
							</button>
							<div class="current-contact-avatar contact-avatar"></div>
							<div class="current-contact"></div>
						</div>
						<div class="chat-header-right">
							<button id="refresh-button" class="refresh-btn" title="Refresh chats and contacts">
								<i class="fa fa-refresh" aria-hidden="true"></i>
							</button>                            
						</div>
					</div>
					<div class="chat-messages"></div>
					<div class="file-preview-container" style="display: none;">
						<div class="file-preview">
							<div class="preview-content"></div>
							<button class="remove-file-btn">
								<i class="fa fa-times" aria-hidden="true"></i>
							</button>
						</div>
					</div>
					<div class="chat-input-container">
						<div class="chat-send-wrapper">
							<textarea id="message-input" placeholder="Type a message"></textarea>
							<div class="chat-actions">
								<button class="attach-file-btn" title="Attach file">
									<i class="fa fa-plus" aria-hidden="true"></i>
								</button>
								<input type="file" id="file-input" style="display: none;" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx">
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
			</div>
		`);
		
		this.setup_events();
		this.setup_mobile_toggler();
		this.setup_refresh_button();
		this.setup_file_upload();
	}

	showContactLoadingSpinner() {
		$('.current-contact').html('<div class="text-center"><i class="fa fa-spinner fa-spin"></i> Loading...</div>');
	}
	  
	
	setup_refresh_button() {
		const self = this;		
		$('#refresh-button').on('click', function() {
			self.refresh_all();
		});
	}
	
	refresh_all() {
		$('.chat-messages').empty();
		$('#send-button').hide();
		this.showContactLoadingSpinner();				
		this.load_contacts();		
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

	show_new_contact_dialog() {
		const me = this;
		
		let dialog = new frappe.ui.Dialog({
		  title: 'Send Message to New Number',
		  fields: [
			{
			  label: 'Phone Number',
			  fieldname: 'phone_number',
			  fieldtype: 'Data',
			  reqd: 1,
			  description: 'Enter phone number with country code (e.g., +919876543210)'
			}
		  ],
		  primary_action_label: 'Start Chat',
		  primary_action(values) {
			if (!values.phone_number) return;
			
			// Clean the phone number (remove spaces, hyphens, parentheses)
			let phoneNumber = values.phone_number.replace(/[\s\-()]/g, '');

			// Ensure it starts with a '+'
			if (!phoneNumber.startsWith('+')) {
			phoneNumber = '+' + phoneNumber;
			}
			
			// Set as current contact and load an empty message list
			me.current_contact = phoneNumber;
			
			// Update UI
			$('.current-contact').text(phoneNumber);
			$('.chat-messages').empty().append('<div class="no-messages">No messages yet</div>');
			$('.chat-input-container').show();
			
			// Add to contact list if not already present
			if ($('.contact-item[data-number="' + phoneNumber + '"]').length === 0) {
			  const contactItem = $(`
				<div class="contact-item" data-number="${phoneNumber}">
				  <div class="contact-avatar">${phoneNumber.charAt(1)}</div>
				  <div class="contact-info">
					<div class="contact-name">New Contact</div>
					<div class="contact-number">${phoneNumber}</div>
				  </div>
				</div>
			  `);
			  
			  	$('.contact-list').prepend(contactItem);

				$(document).on('click', '.new-contact-btn', (e) => {
					e.preventDefault();
					this.show_new_contact_dialog();
				});
				$(document).on('click', '.bulk-message-btn', (e) => {
					e.preventDefault();
					this.show_bulk_message_dialog();
				});

			  // Activate the new contact
			  $('.contact-item').removeClass('active');
			  contactItem.addClass('active');
			}
			
			// On mobile, switch to chat view
			if ($(window).width() <= 768) {
			  $('.chat-sidebar').hide();
			  $('.chat-content').show();
			  $('.back-to-contacts-btn').show();
			}
			
			dialog.hide();
		  }
		});
		
		dialog.show();
	  }
	    
    setup_events() {
		const messageInput = document.getElementById('message-input');
		const sendButton = document.getElementById('send-button');
		$('.bulk-message-btn').on('click', () => {
			this.show_bulk_message_dialog();
		});
	
		// Initially hide the message input container until a chat is selected
		$('.chat-input-container').hide();
	
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
			me.showContactLoadingSpinner();
			$('.contact-item').removeClass('active');
			$(this).addClass('active');
			
			// Get phone number from data attribute
			const phoneNumber = $(this).data('number');
			me.load_messages(phoneNumber);
			$('.chat-input-container').show();
			$('.contact-avatar').show();
		});
		
		// Event for searching contacts
		$('#contact-search').on('input', function() {
			const searchText = $(this).val().toLowerCase();
			const searchTextNoSpaces = searchText.replace(/\s+/g, '');
			
			$('.contact-item').each(function() {
			const contactName = $(this).find('.contact-name').text().toLowerCase();
			const contactNumber = $(this).find('.contact-number').text().toLowerCase();
			const contactNumberNoSpaces = contactNumber.replace(/\s+/g, '');
			
			// Check all possible combinations:
			if (contactName.includes(searchText) || 
				contactNumber.includes(searchText) || 
				contactNumberNoSpaces.includes(searchTextNoSpaces) ||
				contactNumber.includes(searchTextNoSpaces) ||
				contactNumberNoSpaces.includes(searchText)) {
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
			me.send_template();
		});

		$('.new-contact-btn').on('click', function() {
			me.show_new_contact_dialog();
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
		
		// Show the placeholder message when contacts are loading
		this.show_select_chat_placeholder();
		
		this.showContactLoadingSpinner()
		$('.contact-list').html('<div class="text-center p-3"><i class="fa fa-spinner fa-spin"></i> Loading contacts...</div>');
		
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
														name: 'Unknown',
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

	// Add function to show placeholder when no chat is selected
	show_select_chat_placeholder() {
		// Reset the contact header
		$('.current-contact-avatar').html('');
		$('.contact-avatar').hide();
		$('.contact-avatar').html('');
		$('.current-contact').html('');
		
		// Clear chat area and show placeholder
		$('.chat-messages').html(`
			<div class="no-chat-selected">

				<h3>Select a WhatsApp chat to view messages</h3>
				<p>Choose a contact from the list to start viewing messages</p>
			</div>
		`);
		
		// Hide the message input area until a chat is selected
		$('.chat-input-container').hide();
	}
	
	
	render_contacts(contacts) {
		const contactList = $('.contact-list');
		contactList.empty();

		// Show placeholder message in chat area when no contact is selected
		this.show_select_chat_placeholder();
	
		if (contacts.length === 0) {
			contactList.append(`<div class="text-muted p-4">No contacts found</div>`);
			return;
		}
		
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
					const maxLength = 40;
					let preview = msg.message || '';
					preview = preview
						.replace(/_(.*?)_/g, '<i>$1</i>') // Convert _italic_ to <i>italic</i>
						.replace(/\s*\n\s*/g, ' ')
						// .replace(/\*\*(.*?)\*\*/g, (_, p1) => `<b>${p1}</b>`)
					return preview.length > maxLength ? preview.substring(0, maxLength) + '...' : preview;
				}
			};
					

			const formatPhoneNumber = (number) => {
				// Ensure the number is a string
				number = number.toString();
			
				// Remove any existing formatting or plus signs
				number = number.replace(/\D/g, '');
			
				const countryCode = number.slice(0, 2);
				const firstPart = number.slice(2, 7);
				const secondPart = number.slice(7, 12);
			
				return `+${countryCode} ${firstPart} ${secondPart}`;
			};
			

			const contactItem = $(`
				<div class="contact-item" data-number="${contact.number}">
					<div class="contact-avatar">
						${contact.name && contact.name.charAt(0) !== '+' 
							? contact.name.charAt(0).toUpperCase() 
							: 'U'}
					</div>
					<div class="contact-info">
						<div class="contact-header">
							<div class="contact-name">${contact.name === "Unknown" ? formatPhoneNumber(contact.number) : contact.name}</div>
							<div class="contact-number" style="display:none;">
								${formatPhoneNumber(contact.number)}
							</div>
							<div class="contact-time">
								${contact.lastMessage ? formatLastMessageTime(contact.lastMessage.creation) : ''}
							</div>
						</div>
						<div class="contact-message">
							${getMessagePreview(contact.lastMessage)}
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
		
		// Event for searching contacts
		$('#contact-search').on('input', function() { 
			const searchText = $(this).val().toLowerCase();
			const searchTextNoSpaces = searchText.replace(/\s+/g, '');
			
			$('.contact-item').each(function() {
			// Get the contact name and number text
			const contactName = $(this).find('.contact-name').text().toLowerCase();
			const contactNumber = $(this).find('.contact-number').text().toLowerCase();
			const contactNumberNoSpaces = contactNumber.replace(/\s+/g, '');
			
			// Check if search text matches any part of the contact
			const nameMatch = contactName.includes(searchText);
			const numberMatch = contactNumber.includes(searchText);
			const numberNoSpacesMatch = contactNumberNoSpaces.includes(searchTextNoSpaces);
			const mixedMatch1 = contactNumber.includes(searchTextNoSpaces);
			const mixedMatch2 = contactNumberNoSpaces.includes(searchText);
			
			// If any of these conditions are true, show the contact
			if (nameMatch || numberMatch || numberNoSpacesMatch || mixedMatch1 || mixedMatch2) {
				$(this).show();
			} else {
				$(this).hide();
			}
			});
		});
	}
	
		
	load_messages(phoneNumber) {
		const me = this;
		this.current_contact = phoneNumber;
	
		const formatPhoneNumber = (number) => {
			// Ensure the number is a string
			number = number.toString();
		
			// Remove any existing formatting or plus signs
			number = number.replace(/\D/g, '');
		
			const countryCode = number.slice(0, 2);
			const firstPart = number.slice(2, 7);
			const secondPart = number.slice(7, 12);
		
			return `+${countryCode} ${firstPart} ${secondPart}`;
		};
		

		// Show loading in message area
        $('.chat-messages').html('<div class="text-center p-3"><i class="fa fa-spinner fa-spin"></i> Loading messages...</div>');
	
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
					// Show empty chat message
					$('.chat-messages').html(`
						<div class="text-center p-4">
							<div class="empty-chat-icon mb-3">
								<i class="fa fa-comments-o"></i>
							</div>
							<p>No messages found for this contact.</p>
							<p>Start a conversation by sending a message below!</p>
						</div>
					`);
				}
			}).catch(err => {
				frappe.msgprint({
					title: __("Error"),
					message: __("Failed to load messages. Please check console for details."),
					indicator: "red"
				});
			});
		}).catch(err => {
			// Fallback: Update the header with only the formatted phone number
			$('.current-contact').html(`
				<strong>Unknown</strong><br>
				<small>${formatPhoneNumber(phoneNumber)}</small>
			`);
		});
	}

   
    // In the render_messages function, modify the messageItem creation to include the dropdown menu

	render_messages(messages, phoneNumber) {
		const me = this; // Make sure 'this' reference is stored properly
		const messagesContainer = $('.chat-messages');
		messagesContainer.empty();

		let currentDate = null;
		
		// First pass: separate regular messages and reactions
		const regularMessages = [];
		const reactionMessages = {};
		
		// Process messages to identify reactions and their targets
		messages.forEach((msg) => {
			if (msg.content_type === 'reaction' && msg.reply_to_message_id && msg.message) {
				// Store reactions by the ID of the message they're reacting to
				if (!reactionMessages[msg.reply_to_message_id]) {
					reactionMessages[msg.reply_to_message_id] = [];
				}
				reactionMessages[msg.reply_to_message_id].push({
					emoji: msg.message,
					from: msg.from,
					name: msg.name,
					creation: msg.creation
				});
			} else {
				// Store regular messages
				regularMessages.push(msg);
			}
		});
		
		// Second pass: render regular messages with their reactions
		regularMessages.forEach((msg, index) => {
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

			let isOutgoing = msg.to == phoneNumber;
			let messageClass = isOutgoing ? 'outgoing' : 'incoming';
			let messageContent = msg.message || '';
			
			// Format the text content
			let formattedMessage = messageContent
				.replace(/\*/g, '**') // Optional: unify bold markers
				.replace(/\n/g, '<br>') // Convert newlines to <br>
				.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Convert **bold** to <b>bold</b>
				.replace(/_(.*?)_/g, '<i>$1</i>'); // Convert _italic_ to <i>italic</i>
			
			// Start with an empty template
			let wrappedTemplate = '';
			
			// 1. Append media (image/file) first
			if (msg.attach) {
				// Check if it's an image by file extension OR content_type
				const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
				const isImageFile = imageExtensions.some(ext => 
					msg.attach.toLowerCase().includes(ext.toLowerCase())
				);
				
				// Process attachment URL
				let attachmentUrl;
				if (msg.attach.startsWith('/')) {
					attachmentUrl = window.location.origin + msg.attach;
				} else if (msg.attach.startsWith('http')) {
					attachmentUrl = msg.attach;
				} else {
					attachmentUrl = window.location.origin + '/' + msg.attach;
				}
				
				if (isImageFile || msg.content_type === 'image') {
					wrappedTemplate += `
						<div class="message-image-container" style="
							position: relative;
							width: 100%;
							margin-bottom: ${formattedMessage.trim() !== '' ? '8px' : '0'};
							border-radius: 8px;
							overflow: hidden;
							background: #f0f0f0;
							cursor: pointer;
							border: 1px solid #ddd;
						">
							<img 
								src="${attachmentUrl}" 
								class="message-image"
								style="
									width: 100%;
									height: auto;
									max-height: 300px;
									object-fit: cover;
									display: block;
									border-radius: 8px;
									transition: opacity 0.3s ease;
								"
								onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
							/>
							<div class="image-error-placeholder" style="
								display: none;
								align-items: center;
								justify-content: center;
								height: 120px;
								background: #e0e0e0;
								color: #666;
								font-size: 14px;
								text-align: center;
								border-radius: 8px;
							">
								<div>
									<i class="fa fa-image" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
									Image unavailable
								</div>
							</div>
						</div>
					`;
				} else if (['document', 'audio', 'video'].includes(msg.content_type)) {
					wrappedTemplate += `<div style="margin-bottom: 5px;">
						<a href="${attachmentUrl}" target="_blank" style="color: #53BDEB;">
							Click Here to Open ${msg.content_type}
						</a>
					</div>`;
				}
			}
			
			// 2. Then add the text *after* the image/file
			if (formattedMessage.trim() !== '') {
				wrappedTemplate += `<div style="white-space: pre-wrap;">${formattedMessage}</div>`;
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
				if (status === 'failed') {
					return `
						<span class="fa-stack fa-sm text-primary">
							<i class="fa fa-exclamation-triangle fa-stack-1x" style="color: #db2315; margin-bottom: 0px;"></i>
						</span>`;
				}
				return '';
			};

			// Format time in 12-hour format (WhatsApp style)
			const formatTime = (date) => {
				return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
			};

			// Create the message item with dropdown menu
			const messageItem = $(`
				<div class="message ${messageClass}" data-name="${msg.name}">
					<div class="message-dropdown">
						<i class="fa fa-chevron-down message-dropdown-toggle"></i>
						<div class="message-dropdown-menu">
							<div class="message-dropdown-item delete-message">
								<i class="fa fa-trash"></i><span class="delete-label"> Delete For Me</span>
							</div>
						</div>
					</div>
					<div class="message-content">${wrappedTemplate}</div>
					<div class="message-meta" style="text-align: right; align-items: center;">
						<span class="message-time">
							${formatTime(messageDate)}
						</span>
						${isOutgoing ? `<span class="message-status">${getMessageStatusIcon(msg.status || 'sent')}</span>` : ''}
					</div>
				</div>
			`);

			// Add image click handler for opening image viewer
			messageItem.find('.message-image-container').on('click', function(e) {
				e.stopPropagation();
				const imgSrc = $(this).find('img').attr('src');
				if (imgSrc && me.openImageViewer) {
					me.openImageViewer(imgSrc);
				}
			});

			// Add right-click handler to open dropdown
			messageItem.on('contextmenu', function(e) {
				// Only open if right-click is not on a link or selectable element
				if ($(e.target).closest('.message-dropdown-menu, a, input, textarea, button').length) return;

				e.preventDefault();
				e.stopPropagation(); // Prevent document contextmenu from firing

				// Close all other dropdowns
				$('.message-dropdown-menu').removeClass('show').css({top: '', left: '', position: ''});
				$('.message-dropdown').removeClass('active');

				// Find the dropdown menu for this message
				const dropdown = $(this).find('.message-dropdown');
				const menu = dropdown.find('.message-dropdown-menu');

				// Show and position the menu at mouse location (viewport)
				dropdown.addClass('active');
				menu.addClass('show');

				// Use viewport coordinates for absolute positioning
				menu.css({
					position: 'fixed',
					left: e.clientX + 'px',
					top: e.clientY + 'px',
					minWidth: '160px',
					zIndex: 9999
				});
			});

			// Add click handler for dropdown toggle
			messageItem.find('.message-dropdown-toggle').on('click', function(e) {
				e.stopPropagation();

				// Close all other open dropdown menus first
				$('.message-dropdown-menu').not($(this).siblings('.message-dropdown-menu')).removeClass('show').css({top: '', left: '', position: ''});
				$('.message-dropdown').not($(this).parent()).removeClass('active');

				// Toggle this dropdown menu
				const menu = $(this).siblings('.message-dropdown-menu');
				const parent = $(this).parent('.message-dropdown');
				menu.toggleClass('show');
				parent.toggleClass('active');

				// Reset menu position to default (relative to parent)
				if (menu.hasClass('show')) {
					menu.css({position: '', left: '', top: '', minWidth: '', zIndex: ''});
				}
			});

			// Add click handler for delete message option
			messageItem.find('.delete-message').on('click', function(e) {
				e.stopPropagation();
				const msgName = $(this).closest('.message').attr('data-name'); // Use attr instead of data for reliability
				console.log("Deleting message with name:", msgName); // Debugging: Log the `msgName`
				
				// Hide the dropdown menu when delete is clicked
				$(this).closest('.message-dropdown-menu').removeClass('show');
				$(this).closest('.message-dropdown').removeClass('active');
				
				if (msgName) {
					me.deleteMessage(msgName); // Call the deleteMessage function with the message name
				} else {
					console.error("Message name not found", $(this).closest('.message'));
					frappe.throw("Error: Could not delete message. Message ID not found.");
				}
			});
			

			// Add reactions to this message if there are any
			if (msg.message_id && reactionMessages[msg.message_id] && reactionMessages[msg.message_id].length > 0) {
				// Create a reactions container
				const reactionsContainer = $(`<div class="message-reactions"></div>`);
				
				// Add each reaction emoji
				reactionMessages[msg.message_id].forEach(reaction => {
					const reactionElement = $(`
						<div class="reaction-bubble" data-name="${reaction.name}" title="Reaction from ${reaction.from}">
							${reaction.emoji}
						</div>
					`);
					
					// Add delete capability to reaction if it's from the current user
					if (reaction.from === me.user_phone) {
						reactionElement.on('click', function() {
							me.deleteMessage(reaction.name);
						});
						reactionElement.addClass('own-reaction');
					}
					
					reactionsContainer.append(reactionElement);
				});
				
				// Append reactions to the message
				messageItem.append(reactionsContainer);
			}
			
			messagesContainer.append(messageItem);
		});

		// Close dropdowns when clicking elsewhere
		$(document).on('click', function(e) {
			if ($(e.target).closest('.message-dropdown').length === 0) {
				$('.message-dropdown-menu').removeClass('show').css({top: '', left: '', position: ''});
				$('.message-dropdown').removeClass('active');
			}
		});

		// Close dropdowns when right-clicking elsewhere
		$(document).on('contextmenu', function(e) {
			if ($(e.target).closest('.message-dropdown').length === 0) {
				$('.message-dropdown-menu').removeClass('show').css({top: '', left: '', position: ''});
				$('.message-dropdown').removeClass('active');
			}
		});

		// Scroll to bottom
		setTimeout(() => {
			messagesContainer.scrollTop(messagesContainer[0].scrollHeight);
		}, 100);

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
				const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'FEB', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
				return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
			}
		}

		
	}
	
	// Make sure this method is included in your WhatsAppChatInterface class
	deleteMessage(msgName) {
		if (!msgName) {
			console.error("Cannot delete message: No message name provided");
			return;
		}
		
		const me = this;
	
		// Show confirmation dialog
		frappe.confirm(
			'Are you sure you want to delete this message?',
			function() {
				// On yes
				frappe.call({
					method: 'frappe.client.delete',
					args: {
						doctype: 'WhatsApp Message',
						name: msgName
					},
					callback: function(response) {
						if (response.exc) {
							// If there was an error
							console.error("Delete error:", response.exc);
							frappe.msgprint({
								title: __("Error"),
								message: __("Could not delete message. " + response.exc),
								indicator: "red"
							});
						} else {
							// Remove the message from UI
							$(`.message[data-name="${msgName}"]`).fadeOut(300, function() {
								$(this).remove();
	

								// Reload all messages to refresh the view
								if (me.current_contact) {
									me.load_messages(me.current_contact);
								}
							});
						}
					}
				});
			},
			function() {
				// On no - do nothing
			}
		);
	}

	
	setup_file_upload() {
		const me = this;
		
		// Click on attach button should open Frappe's file browser
		$('.attach-file-btn').on('click', function() {
		  // Use Frappe's built-in file browser dialog
		  new frappe.ui.FileUploader({
			folder: "Home/Attachments",
			doctype: "User", // Change this to the appropriate doctype for your use case
			docname: frappe.session.user, // Change this to the appropriate docname for your use case
			restrictions: {
			  allowed_file_types: ["image/*", ".pdf", ".doc", ".docx", ".xlsx", ".xls"] // Optional: specify allowed file types
			},
			multiple: false, // Set to true if you want to allow multiple files
			on_success: function(file_doc) {
			  const filePreviewContainer = $('.file-preview-container');
			  const previewContent = $('.preview-content');
			  
			  // Clear previous preview
			  previewContent.empty();
			  
			  // Create a file object mock and store it
			  const fileMock = {
				name: file_doc.file_name,
				type: file_doc.file_type || determine_file_type(file_doc.file_name),
				size: file_doc.file_size || 0
			  };
			  
			  // Store the file data as data attributes
			  $('#file-input').data('file', fileMock);
			  $('#file-input').data('file-url', file_doc.file_url);
			  $('#file-input').data('file-name', file_doc.file_name);
			  $('#file-input').data('file-id', file_doc.name);
			  
			  // Update preview based on file type
			  const isImage = file_doc.is_image || file_doc.file_name.match(/\.(jpeg|jpg|gif|png)$/i);
			  
			  if (isImage) {
				// Image preview
				previewContent.html(`
				  <div class="image-preview">
					<img src="${file_doc.file_url}" alt="Preview">
					<div class="file-name">${file_doc.file_name}</div>
				  </div>
				`);
			  } else {
				// Document preview
				let icon = 'fa-file';
				const fileName = file_doc.file_name.toLowerCase();
				if (fileName.endsWith('.pdf')) icon = 'fa-file-pdf-o';
				else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) icon = 'fa-file-word-o';
				else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) icon = 'fa-file-excel-o';
				
				previewContent.html(`
				  <div class="doc-preview">
					<i class="fa ${icon} fa-3x" aria-hidden="true"></i>
					<div class="file-name">${file_doc.file_name}</div>
				  </div>
				`);
			  }
			  
			  // Show preview container
			  filePreviewContainer.show();
			  
			  // Show the send button
			  $('#send-button').show();
			}
		  });
		});
		
		// Helper function to determine file type from extension
		function determine_file_type(filename) {
			const ext = filename.split('.').pop().toLowerCase();
			const imgExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
			const docExts = ['pdf', 'doc', 'docx'];
			const sheetExts = ['xls', 'xlsx', 'csv'];
		  
			if (imgExts.includes(ext)) return 'image/' + (ext === 'jpg' ? 'jpeg' : ext);
			if (docExts.includes(ext)) return 'application/' + (ext === 'doc' || ext === 'docx' ? 'msword' : ext);
			if (sheetExts.includes(ext)) return 'application/spreadsheet';
		  
			return 'application/octet-stream';
		  }
		
		// Remove file button
		$('.remove-file-btn').on('click', function() {
		  const fileId = $('#file-input').data('file-id');
		  
		  // If a file was uploaded, remove it from Frappe
		  if (fileId) {
			frappe.call({
			  method: 'frappe.client.delete',
			  args: {
				doctype: 'File',
				name: fileId
			  },
			  callback: function(r) {
				console.log('File removed:', fileId);
			  }
			});
		  }
		  
		  // Clear input and data
		  $('#file-input').val('');
		  $('#file-input').removeData('file');
		  $('#file-input').removeData('file-url');
		  $('#file-input').removeData('file-name');
		  $('#file-input').removeData('file-id');
		  $('.file-preview-container').hide();
		  
		  // Hide the send button if there's no text
		  if ($('#message-input').val().trim() === '') {
			$('#send-button').hide();
		  }
		});
		
		// Function to get file data for sending with message
		this.get_file_attachment = function() {
		  const fileUrl = $('#file-input').data('file-url');
		  const fileName = $('#file-input').data('file-name');
		  const fileId = $('#file-input').data('file-id');
		  
		  if (fileUrl && fileName && fileId) {
			return {
			  file_url: fileUrl,
			  file_name: fileName,
			  file_id: fileId
			};
		  }
		  return null;
		};
		
		// Function to get mock file object for compatibility with existing code
		this.get_file_object = function() {
		  return $('#file-input').data('file') || null;
		};
	  }
	
	send_message() {
		const messageInput = $('#message-input');
		const message = messageInput.val().trim();
		const fileInput = $('#file-input');
		const fileUrl = fileInput.data('file-url');
		
		if ((!message && !fileUrl) || !this.current_contact) return;
		
		const me = this;
		
		// Determine content type based on file
		let contentType = 'text';
		
		if (fileUrl) {
			const fileName = fileInput.data('file-name').toLowerCase();
			if (fileName.match(/\.(jpeg|jpg|gif|png|svg|webp)$/)) {
				contentType = 'image';
			} else {
				contentType = 'document';
			}
		}
		
		// Ensure the phone number is a string
		const phoneNumber = String(this.current_contact);
		
		// Create the WhatsApp message
		frappe.call({
			method: 'frappe.client.insert',
			args: {
				doc: {
					doctype: 'WhatsApp Message',
					type: 'Outgoing',
					to: phoneNumber, // Now it's guaranteed to be a string
					message: message,
					content_type: contentType,
					attach: fileUrl || null,
					status: 'queued'
				}
			},
			callback: function(r) {
				if (r.message) {
					// Clear inputs
					messageInput.val('');
					fileInput.val('');
					fileInput.removeData('file-url');
					$('.file-preview-container').hide();
					$('#send-button').hide();
					
					// Reload messages
					me.load_messages(me.current_contact);
				}
			},
			error: function(xhr, status) {
				frappe.msgprint({
					title: __('Error'),
					indicator: 'red',
					message: __('Failed to send message. Please try again.')
				});
				console.error(xhr.responseText);
			}
		});
	}
    
   send_template() {
	const me = this;
	
	// Create a dialog with initial template selection only
	let dialog = new frappe.ui.Dialog({
	title: 'Send Template Message',
	fields: [
		{
		label: 'Template',
		fieldname: 'template',
		fieldtype: 'Link',
		options: 'WhatsApp Templates',
		reqd: 1,
		onchange: function() {
			// When template changes, fetch its details
			if (this.value) {
			frappe.call({
				method: 'frappe.client.get',
				args: {
				doctype: 'WhatsApp Templates',
				name: this.value
				},
				callback: function(r) {
				if (r.message) {
					// Update preview
					me.updateTemplatePreview(dialog, r.message);
					
					// Show/hide file attachment field based on template header type
					const templateData = r.message;
					if (templateData.header_type && ['IMAGE', 'DOCUMENT', 'VIDEO'].includes(templateData.header_type)) {
						dialog.set_df_property('file_section', 'hidden', 0);
						dialog.set_df_property('attach', 'hidden', 0);
						dialog.set_df_property('attach', 'reqd', 1);
						dialog.set_df_property('attach', 'description', `This template requires a ${templateData.header_type.toLowerCase()} file`);
					} else {
						dialog.set_df_property('file_section', 'hidden', 1);
						dialog.set_df_property('attach', 'hidden', 1);
						dialog.set_df_property('attach', 'reqd', 0);
					}
					
					// Check if template has variables (look for {{}} patterns)
					const templateText = r.message.template || '';
					const variableMatches = templateText.match(/\{\{([^}]+)\}\}/g);
					
					if (variableMatches && variableMatches.length > 0) {
					// Extract variable names from {{variable}} patterns
					let sampleValues = {};
					variableMatches.forEach(match => {
						const variableName = match.replace(/[{}]/g, '');
						sampleValues[variableName] = `[${variableName}]`; // Default sample value
					});
					
					// If sample_values field exists, try to parse it
					if (r.message.sample_values) {
						try {
						const parsedSampleValues = JSON.parse(r.message.sample_values);
						sampleValues = { ...sampleValues, ...parsedSampleValues };
						} catch (e) {
						// Keep the default sample values if parsing fails
						}
					}
					
					const variables = Object.keys(sampleValues);
					
					if (variables.length > 0) {
						// Show doctype and document selection fields
						dialog.set_df_property('reference_doctype_section', 'hidden', 0);
						dialog.set_df_property('reference_doctype', 'hidden', 0);
						dialog.set_df_property('reference_name', 'hidden', 0);
						dialog.set_df_property('custom_data', 'hidden', 0);
						
						// Setup the field mapping child table
						let field_mapping_fields = [];
						variables.forEach((variable, index) => {
						field_mapping_fields.push({
							variable: variable,
							sample_value: sampleValues[variable],
							docfield: ""
						});
						});
						
						dialog.set_value('field_mappings', field_mapping_fields);
					} else {
						// Hide document selection fields if no variables
						dialog.set_df_property('reference_doctype_section', 'hidden', 1);
						dialog.set_df_property('reference_doctype', 'hidden', 1);
						dialog.set_df_property('reference_name', 'hidden', 1);
						dialog.set_df_property('custom_data', 'hidden', 1);
						dialog.set_df_property('field_mapping_section', 'hidden', 1);
					}
					} else {
					// Hide document selection fields if no sample values
					dialog.set_df_property('reference_doctype_section', 'hidden', 1);
					dialog.set_df_property('reference_doctype', 'hidden', 1);
					dialog.set_df_property('reference_name', 'hidden', 1);
					dialog.set_df_property('custom_data', 'hidden', 1);
					dialog.set_df_property('field_mapping_section', 'hidden', 1);
					}
				}
				}
			});
			} else {
			// Clear preview when no template selected
			dialog.set_df_property('template_preview', 'options', '');
			dialog.set_df_property('file_section', 'hidden', 1);
			dialog.set_df_property('attach', 'hidden', 1);
			}
		}
		},
		{
		fieldtype: 'Section Break',
		fieldname: 'file_section',
		label: 'File Attachment',
		hidden: 1
		},
		{
		label: 'Attach File',
		fieldname: 'attach',
		fieldtype: 'Attach',
		hidden: 1,
		description: 'Required for templates with IMAGE, DOCUMENT, or VIDEO header'
		},
		{
		fieldtype: 'Section Break',
		fieldname: 'preview_section',
		label: 'Template Preview'
		},
		{
		fieldtype: 'HTML',
		fieldname: 'template_preview',
		options: '<div style="text-align: center; padding: 20px; color: #8d99a6;">Select a template to see preview</div>'
		},
		{
		fieldtype: 'Section Break',
		fieldname: 'reference_doctype_section',
		label: 'Document Reference',
		hidden: 1
		},
		{
		label: 'Select Document Type',
		fieldname: 'reference_doctype',
		fieldtype: 'Link',
		options: 'DocType',
		hidden: 1,
		onchange: function() {
			if (this.value) {
			// Update reference_name to be a link field of the selected doctype
			dialog.fields_dict.reference_name.df.options = this.value;
			dialog.fields_dict.reference_name.refresh();
			
			// Get fields of the selected doctype for mapping
			frappe.model.with_doctype(this.value, function() {
				let fields = frappe.meta.get_docfields(dialog.get_value('reference_doctype'), null, {
				fieldtype: ['not in', ['Section Break', 'Column Break', 'Tab Break', 'HTML', 'Table', 'Button', 'Image']]
				});
				
				// Update the docfield options in the field mappings table
				let docfields = fields.map(f => ({ value: f.fieldname, label: `${f.label || f.fieldname} (${f.fieldtype})` }));
				
				dialog.fields_dict.field_mappings.grid.update_docfield_property(
				'docfield', 'options', docfields
				);
				
				// Refresh the grid to show updated options
				dialog.fields_dict.field_mappings.grid.refresh();
			});
			}
		}
		},
		{
		label: 'Select Document',
		fieldname: 'reference_name',
		fieldtype: 'Link',
		options: 'reference_doctype',
		hidden: 1,
		onchange: function() {
			// Update preview when document changes
			if (this.value && dialog.get_value('reference_doctype')) {
			me.updatePreviewWithDocumentData(dialog);
			}
		}
		},
		{
		fieldtype: 'Check',
		fieldname: 'custom_data',
		label: 'Custom Data',
		hidden: 1,
		onchange: function () {
			// Use the checkbox's current value (true/false)
			if (this.get_value()) {
			dialog.set_df_property('field_mapping_section', 'hidden', 0); // show
			} else {
			dialog.set_df_property('field_mapping_section', 'hidden', 1); // hide
			}
			// Update preview when custom data setting changes
			me.updatePreviewWithDocumentData(dialog);
		}
		},
		{
		fieldtype: 'Section Break',
		fieldname: 'field_mapping_section',
		label: 'Map Document Fields to Template Variables',
		hidden: 1
		},
		{
		fieldname: 'field_mappings',
		fieldtype: 'Table',
		hidden: 0,
		fields: [
			{
			fieldname: 'variable',
			fieldtype: 'Data',
			label: 'Template Variable',
			in_list_view: 1,
			read_only: 1
			},
			{
			fieldname: 'docfield',
			fieldtype: 'Autocomplete',
			label: 'Document Field',
			in_list_view: 1,
			options: [],
			onchange: function() {
				// Update preview when field mapping changes
				me.updatePreviewWithDocumentData(dialog);
			}
			}
		]
		}
	],
	primary_action_label: 'Send',
	primary_action(values) {
		if (!me.current_contact) return;
		
		// Prepare the message doc
		let msg_doc = {
		doctype: 'WhatsApp Message',
		type: 'Outgoing',
		to: me.current_contact,
		use_template: 1,
		custom_data: values.custom_data ? 1 : 0,
		template: values.template,
		content_type: 'text',
		message_type: 'Template',
		status: 'queued',
		reference_doctype: values.reference_doctype || null,
		reference_name: values.reference_name || null,
		attach: values.attach || null // Add file attachment
		};
		
		// Handle parameter building
		if (values.custom_data && values.reference_doctype && values.reference_name && values.field_mappings) {
		frappe.call({
			method: 'frappe.client.get',
			args: {
			doctype: values.reference_doctype,
			name: values.reference_name
			},
			callback: function(r) {
			if (r.message) {
				const doc = r.message;
				let parameters = {};
				let fields = [];
				
				// Construct parameters from field mappings and prepare fields table data
				(values.field_mappings || []).forEach(mapping => {
				if (mapping.docfield && mapping.variable) {
					parameters[mapping.variable] = doc[mapping.docfield] || '';
					
					// Add to fields table
					fields.push({
					variable: mapping.variable,
					field_name: mapping.docfield,
					value: doc[mapping.docfield] || ''
					});
				}
				});
				
				msg_doc.template_parameters = JSON.stringify(parameters);
				msg_doc.fields = fields;  // Add fields array for child table
				
				// Insert the message doc
				frappe.call({
				method: 'frappe.client.insert',
				args: { doc: msg_doc },
				callback: function(r) {
					if (r.message) {
					me.load_messages(me.current_contact);
					frappe.show_alert({
						message: __('Template message queued for sending'),
						indicator: 'green'
					});
					}
				}
				});
			}
			}
		});
		} else {
		// Simple template with no custom data
		msg_doc.template_parameters = '{}';
		
		frappe.call({
			method: 'frappe.client.insert',
			args: { doc: msg_doc },
			callback: function(r) {
			if (r.message) {
				me.load_messages(me.current_contact);
				frappe.show_alert({
				message: __('Template message queued for sending'),
				indicator: 'green'
				});
			}
			}
		});
		}
		
		dialog.hide();
	}
	});
	
	dialog.show();
}

// Add these helper methods to your WhatsAppChatInterface class
updateTemplatePreview(dialog, templateData) {
	const previewHtml = this.generateTemplatePreview(templateData);
	dialog.set_df_property('template_preview', 'options', previewHtml);
}

// Alternative approach: Update the generateTemplatePreview method to handle newlines properly
generateTemplatePreview(templateData) {
    const headerText = templateData.header || '';
    const bodyText = templateData.template || templateData.body || '';
    const footerText = templateData.footer || '';
    
    let previewHtml = `
        <div style="text-align: center; padding: 10px 0;">
            <div style="
                display: inline-block;
                border-radius: 8px; 
                padding: 12px 16px; 
                background: #005C4B;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 280px;
                text-align: left;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            ">
    `;
    
    // Add header if exists
    if (headerText) {
        previewHtml += `
            <div style="
                font-weight: 600; 
                margin-bottom: 6px; 
                color:rgb(221, 221, 221);
                font-size: 14px;
            ">
                ${this.escapeHtml(headerText)}
            </div>
        `;
    }
    
    // Add body/template content - remove white-space: pre-wrap since we're using <br> tags
    if (bodyText) {
        previewHtml += `
            <div style="
                line-height: 1.4; 
                color: #ffffff;
                font-size: 14px;
                margin-bottom: ${footerText ? '8px' : '0'};
            ">
                ${this.escapeHtml(bodyText)}
            </div>
        `;
    }
    
    // Add footer if exists
    if (footerText) {
        previewHtml += `
            <div style="
                font-size: 12px; 
                color: rgb(221, 221, 221);
            ">
                ${this.escapeHtml(footerText)}
            </div>
        `;
    }
    
    previewHtml += `
            </div>
        </div>
    `;
    
    return previewHtml;
}

updatePreviewWithDocumentData(dialog) {
	const templateName = dialog.get_value('template');
	
	if (!templateName) {
		return;
	}
	
	// Get template data and show simple preview
	frappe.call({
		method: 'frappe.client.get',
		args: {
			doctype: 'WhatsApp Templates',
			name: templateName
		},
		callback: (templateResponse) => {
			if (templateResponse.message) {
				const templateData = templateResponse.message;
				this.updateTemplatePreview(dialog, templateData);
			}
		}
	});
}

// Updated helper method to preserve newlines and handle WhatsApp markdown
escapeHtml(text) {
    if (!text) return '';
    
    // First escape HTML characters
    let escapedText = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    
    // Convert WhatsApp markdown to HTML
    // Bold: *text* -> <strong>text</strong>
    escapedText = escapedText.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
    
    // Italic: _text_ -> <em>text</em>
    escapedText = escapedText.replace(/_([^_]+)_/g, '<em>$1</em>');
    
    // Strikethrough: ~text~ -> <del>text</del>
    escapedText = escapedText.replace(/~([^~]+)~/g, '<del>$1</del>');
    
    // Monospace: ```text``` -> <code>text</code>
    escapedText = escapedText.replace(/```([^`]+)```/g, '<code style="background: rgba(255,255,255,0.1); padding: 2px 4px; border-radius: 3px;">$1</code>');
    
    // Convert newlines to <br> tags
    escapedText = escapedText.replace(/\n/g, '<br>');
    
    return escapedText;
}

show_bulk_message_dialog() {
	const me = this;
	let dialog = new frappe.ui.Dialog({
		title: 'Send Bulk WhatsApp Message',
		fields: [
			{
				label: 'Title',
				fieldname: 'title',
				fieldtype: 'Data',
				reqd: 1
			},
			{
				label: 'Recipient Type',
				fieldname: 'recipient_type',
				fieldtype: 'Select',
				options: ['Individual', 'Group'],
				reqd: 1,
				default: 'Individual',
				onchange: function() {
					const val = dialog.get_value('recipient_type');
					dialog.set_df_property('mobile_numbers', 'hidden', val !== 'Individual');
					dialog.set_df_property('recipient_list', 'hidden', val !== 'Group');
				}
			},
			{
				label: 'Mobile Numbers (one per line, with country code)',
				fieldname: 'mobile_numbers',
				fieldtype: 'Text',
				reqd: 1,
				description: 'Example:\n+919512345678\n+919876543210',
				hidden: 0
			},
			{
				label: 'Recipient List',
				fieldname: 'recipient_list',
				fieldtype: 'Link',
				options: 'WhatsApp Recipient List',
				hidden: 1
			},
			{
				label: 'Use Template',
				fieldname: 'use_template',
				fieldtype: 'Check',
				default: 1,
				onchange: function() {
					const useTemplate = dialog.get_value('use_template');
					dialog.set_df_property('message', 'hidden', useTemplate);
					dialog.set_df_property('template', 'hidden', !useTemplate);
					dialog.set_df_property('template_variables_section', 'hidden', !useTemplate);
					dialog.set_df_property('file_section', 'hidden', !useTemplate);
				}
			},
			{
				label: 'Message',
				fieldname: 'message',
				fieldtype: 'Text',
				depends_on: 'eval:!doc.use_template',
				hidden: 1
			},
			{
				label: 'Template',
				fieldname: 'template',
				fieldtype: 'Link',
				options: 'WhatsApp Templates',
				depends_on: 'use_template',
				onchange: function() {
					if (this.value) {
						// Fetch template details to check for file requirements
						frappe.call({
							method: 'frappe.client.get',
							args: {
								doctype: 'WhatsApp Templates',
								name: this.value
							},
							callback: function(r) {
								if (r.message) {
									const templateData = r.message;
									
									// Show/hide file attachment based on template header type
									if (templateData.header_type && ['IMAGE', 'DOCUMENT', 'VIDEO'].includes(templateData.header_type)) {
										dialog.set_df_property('file_section', 'hidden', 0);
										dialog.set_df_property('attach', 'hidden', 0);
										dialog.set_df_property('attach', 'reqd', 1);
										dialog.set_df_property('attach', 'description', 
											`This template requires a ${templateData.header_type.toLowerCase()} file`);
									} else {
										dialog.set_df_property('file_section', 'hidden', 1);
										dialog.set_df_property('attach', 'hidden', 1);
										dialog.set_df_property('attach', 'reqd', 0);
									}
									
									// Check for template variables
									const templateText = templateData.template || '';
									const variableMatches = templateText.match(/\{\{([^}]+)\}\}/g);
									
									if (variableMatches && variableMatches.length > 0) {
										dialog.set_df_property('template_variables_section', 'hidden', 0);
										dialog.set_df_property('template_variables', 'hidden', 0);
										
										// Show helper text for variables
										const variables = variableMatches.map(match => match.replace(/[{}]/g, ''));
										dialog.set_df_property('template_variables', 'description', 
											`Template variables found: ${variables.join(', ')}. You can provide JSON data for variable replacement.`);
									} else {
										dialog.set_df_property('template_variables_section', 'hidden', 1);
										dialog.set_df_property('template_variables', 'hidden', 1);
									}
								}
							}
						});
					} else {
						dialog.set_df_property('file_section', 'hidden', 1);
						dialog.set_df_property('template_variables_section', 'hidden', 1);
					}
				}
			},
			{
				fieldtype: 'Section Break',
				fieldname: 'file_section',
				label: 'File Attachment',
				hidden: 1
			},
			{
				label: 'Attach File',
				fieldname: 'attach',
				fieldtype: 'Attach',
				hidden: 1,
				description: 'Required for templates with IMAGE, DOCUMENT, or VIDEO header'
			},
			{
				fieldtype: 'Section Break',
				fieldname: 'template_variables_section',
				label: 'Template Variables',
				hidden: 1
			},
			{
				label: 'Template Variables (JSON)',
				fieldname: 'template_variables',
				fieldtype: 'Code',
				options: 'JSON',
				hidden: 1,
				description: 'Provide JSON data for template variable replacement. Example: {"name": "John", "amount": "100"}'
			}
		],
		primary_action_label: 'Send',
		primary_action(values) {
			if (!values.title) {
				frappe.msgprint('Please enter a Title.');
				return;
			}
			
			// Validate template requirements
			if (values.use_template && values.template) {
				frappe.call({
					method: 'frappe.client.get',
					args: {
						doctype: 'WhatsApp Templates',
						name: values.template
					},
					callback: function(r) {
						if (r.message) {
							const templateData = r.message;
							
							// Check file requirement
							if (templateData.header_type && ['IMAGE', 'DOCUMENT', 'VIDEO'].includes(templateData.header_type)) {
								if (!values.attach) {
									frappe.msgprint(`This template requires a ${templateData.header_type.toLowerCase()} file. Please attach one.`);
									return;
								}
							}
							
							// Proceed with bulk message creation
							me.createBulkMessage(values, dialog);
						}
					}
				});
			} else {
				// No template validation needed
				me.createBulkMessage(values);
			}
		}
	});
	
	dialog.set_df_property('mobile_numbers', 'hidden', 0);
	dialog.set_df_property('recipient_list', 'hidden', 1);
	dialog.set_df_property('message', 'hidden', 1);
	dialog.set_df_property('template_variables_section', 'hidden', 1);
	dialog.set_df_property('file_section', 'hidden', 1);
	dialog.show();
}

createBulkMessage(values, dialog) {
	const me = this;
	
	if (values.recipient_type === 'Individual') {
		if (!values.mobile_numbers) {
			frappe.msgprint('Please enter at least one mobile number.');
			return;
		}
		var numbers = values.mobile_numbers.split('\n').map(n => n.trim()).filter(Boolean);
		if (!numbers.length) {
			frappe.msgprint('Please enter valid mobile numbers.');
			return;
		}
		
		// Create bulk message doc
		let bulkDoc = {
			doctype: 'Bulk WhatsApp Message',
			title: values.title,
			recipient_type: 'Individual',
			use_template: values.use_template ? 1 : 0,
			message: values.message || '',
			template: values.template || '',
			attach: values.attach || null,
			template_variables: values.template_variables || null,
			recipients: numbers.map(num => ({
				doctype: 'WhatsApp Recipient',
				mobile_number: num
			}))
		};
		
		frappe.call({
    method: 'frappe.client.insert',
    args: { doc: bulkDoc },
    callback: function(r) {
        if (r.message && r.message.name) {
            const insertedDoc = r.message;
            // Submit the document
            frappe.call({
                method: 'frappe.client.submit',
                args: {
                    doc: insertedDoc
                },
                callback: function() {
                    frappe.show_alert({
                        message: 'Bulk WhatsApp Message queued for sending',
                        indicator: 'green'
                    });
                    dialog.hide();
                }
            });
        }
    }
});
	} else if (values.recipient_type === 'Group') {
		if (!values.recipient_list) {
			frappe.msgprint('Please select a Recipient List.');
			return;
		}
		
		let bulkDoc = {
			doctype: 'Bulk WhatsApp Message',
			title: values.title,
			recipient_type: 'Recipient List',
			use_template: values.use_template ? 1 : 0,
			message: values.message || '',
			template: values.template || '',
			attach: values.attach || null,
			template_variables: values.template_variables || null,
			recipient_list: values.recipient_list
		};
		
frappe.call({
    method: 'frappe.client.insert',
    args: { doc: bulkDoc },
    callback: function(r) {
        if (r.message && r.message.name) {
            const insertedDoc = r.message;
            // Submit the document
            frappe.call({
                method: 'frappe.client.submit',
                args: {
                    doc: insertedDoc
                },
                callback: function() {
                    frappe.show_alert({
                        message: 'Bulk WhatsApp Message queued for sending',
                        indicator: 'green'
                    });
                    dialog.hide();
                }
            });
        }
    }
});
	}
}
}