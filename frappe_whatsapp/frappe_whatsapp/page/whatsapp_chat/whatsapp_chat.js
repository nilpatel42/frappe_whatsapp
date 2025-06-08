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
        this.setup_fullscreen_mode();
        this.setup_page_layout();
		this.setup_theme_switcher(); 
        this.load_contacts();
    }

	setup_theme_switcher() {
		const themeBtn = $('#theme-toggle');
		
		// Check if there's a saved theme preference
		const savedTheme = localStorage.getItem('whatsapp_theme');
		if (savedTheme === 'light') {
			$('.chat-container').parent().addClass('light-theme');
			themeBtn.find('i').removeClass('fa-moon-o').addClass('fa-sun-o');
		}
		
		// Theme toggle click handler
		themeBtn.on('click', function() {
			const container = $('.chat-container').parent();
			const icon = $(this).find('i');
			
			if (container.hasClass('light-theme')) {
				// Switch to dark theme
				container.removeClass('light-theme');
				icon.removeClass('fa-sun-o').addClass('fa-moon-o');
				localStorage.setItem('whatsapp_theme', 'dark');
			} else {
				// Switch to light theme
				container.addClass('light-theme');
				icon.removeClass('fa-moon-o').addClass('fa-sun-o');
				localStorage.setItem('whatsapp_theme', 'light');
			}
		});
	}
    
    // Add this new method for fullscreen functionality
    setup_fullscreen_mode() {
        // Hide Frappe header and navigation
		$('.page-head').hide();
		$('.page-body').css({
			'width': '100%'
		});        

        
        // Add custom CSS for full height
        $('<style>')
            .prop('type', 'text/css')
            .html(`
                .page-content {
                    min-height: 93vh !important;
                    padding: 0 !important;
                }
                
                .chat-container {
                    height: 93vh !important;
                    background-color: #111b21;
                }

				@media (max-width: 768px) {
					.page-content {
						min-height: 88vh !important;
					}
					.chat-container {
						height: 88vh !important;
                	}
				}
            `)
            .appendTo('head');
    }
    
            
	add_styles() {
		// Add CSS for the chat interface
		$('<style>').text(`

			.theme-btn {
				background-color: transparent;
				border: none;
				color: #ffffff;
				font-size: 18px;
				cursor: pointer;
				display: flex;
				align-items: center;
				justify-content: center;
				width: 36px;
				height: 36px;
				margin-right: 10px;
			}

			.theme-btn:hover {
				color: rgb(94, 173, 156);
			}

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
				height: 65px;
				padding-top: 12px;
				padding-right: 10px;
				align-items: center;
				display: flex;
				gap: 10px;
			}
			.chat-search input {
				background-color: #202c33;
				border-radius: 6px;
				border: none;
				padding: 8px 12px;
				color: #ffffff;
				width: 100%;
				flex: 1;
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
				width: 80%;
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
				justify-content: space-between;
			}
			.chat-header-left {
				display: flex;
				align-items: center;
			}
			.chat-header-right {
				display: flex;
				align-items: center;
			}
			.refresh-btn {
				background-color: transparent;
				border: none;
				color: #ffffff;
				font-size: 18px;
				cursor: pointer;
				display: flex;
				align-items: center;
				justify-content: center;
				width: 36px;
				height: 36px;
				margin-left: 10px;
			}
			.refresh-btn:hover {
				color: rgb(94, 173, 156);
			}
			.chat-actions {
				display: flex;
				align-items: center;
			}
			
			.attach-file-btn {
				position: absolute;
				background: transparent;
				border: none;
				color: white;
				cursor: pointer;
				font-size: 16px;
				padding: 8px;
				margin-right: 1255px;
				right: 50px;
				top: 50%;
				transform: translateY(-50%);
				width: 36px;
				height: 36px;
				display: flex;
				align-items: center;
				justify-content: center;
				cursor: pointer;
			}
			
			.attach-file-btn:hover {
				color: #25d366;
			}
			
			.file-preview-container {
				padding: 10px 15px;
				background-color: #111b21;
				border-top: 1px solid #ddd;
			}
			
			.file-preview {
				display: flex;
				align-items: center;
				justify-content: space-between;
			}
			
			.preview-content {
				display: flex;
				align-items: center;
				max-width: 90%;
			}
			
			.image-preview {
				display: flex;
				flex-direction: column;
				align-items: center;
			}
			
			.image-preview img {
				max-height: 100px;
				max-width: 200px;
				object-fit: contain;
				border-radius: 4px;
			}
			
			.doc-preview {
				display: flex;
				flex-direction: column;
				align-items: center;
			}
			
			.file-name {
				margin-top: 5px;
				font-size: 12px;
				color: white;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
				max-width: 150px;
			}
			
			.remove-file-btn {
				background: transparent;
				border: none;
				color: #888;
				cursor: pointer;
				padding: 5px;
			}
			
			.remove-file-btn:hover {
				color: #e74c3c;
			}
			
			.file-sending {
				font-size: 12px;
				color: #888;
				margin-top: 5px;
			}
			
			.error-message {
				color: #e74c3c;
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
				margin-right: auto !important;
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
				border-radius: 6px;
				padding: 9px 12px;
				height: 45px;
				border: 1px solid #38424a;
				color: #ffffff;
				background-color: #202c33;
				width: 96.5%;
				padding-right: 40px;
				padding-left: 40px;
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
				margin-right: 0px;
			}
			.message-status {
				font-size: 11px;
				color: #8696a0;
				margin-left: -5px;
				margin-right: -5px;
				margin-bottom: 15px;
			}

			.new-contact-btn {
				width: 32px;
				height: 32px;
				border-radius: 5px;
				background-color: transparent;
				border: None;
				font-size: 22px;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #ffffff;
				opacity: 0.7;
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
            
            /* Fullscreen mobile adjustments */
            @media (max-width: 767px) {
                .chat-container.fullscreen {
                    height: 100vh !important;
                }
            }
			

			/* Light theme styles */

			.light-theme .theme-btn {
				background-color: transparent;
				border: none;
				color: #181D20;
				font-size: 18px;
				cursor: pointer;
				display: flex;
				align-items: center;
				justify-content: center;
				width: 36px;
				height: 36px;
				margin-right: 10px;
			}

			.light-theme .theme-btn:hover {
				color: rgb(94, 173, 156);
			}

			.light-theme .refresh-btn {
				background-color: transparent;
				color: #181D20;
			}
			.light-theme .refresh-btn:hover {
				color: rgb(94, 173, 156);
			}

			.light-theme .chat-container {
				background-color: #dadbd3;
			}

			.light-theme .chat-sidebar {
				border-right: 1px solid #d1d7db;
				background-color: #ffffff;
			}

			.light-theme .chat-search {
				border-bottom: 1px solid #e0e0e0;
			}

			.light-theme .chat-search input {
				background-color: #f0f2f5;
				color: #333333;
			}

			.light-theme .new-contact-btn {
				color: #000000;
			}

			.light-theme .contact-item {
				border-bottom: 1px solid #f0f0f0;
				color: #111b21;
			}

			.light-theme .contact-item:hover {
				background-color: #f5f6f6;
			}

			.light-theme .contact-item.active {
				background-color: #f0f2f5;
			}

			.light-theme .contact-name {
				color: #181D20;
			}

			.light-theme .template-icon-btn {
				color: #000000;
			}

			.light-theme .chat-header {
				background-color: #f0f2f5;
				border-bottom: 1px solid #d1d7db;
				color: #111b21;
			}

			.light-theme .chat-messages {
				background-color: #efeae2;
				background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23aaaaaa' fill-opacity='0.1'/%3E%3C/svg%3E");
			}

			.light-theme .message {
				color: #111b21;
				box-shadow: 0 1px 0.5px rgba(0,0,0,0.13);
			}

			.light-theme .message.incoming {
				background-color: #ffffff;
			}

			.light-theme .message.outgoing {
				background-color: #d9fdd3;
			}

			.light-theme .chat-input-container {
				background-color: #f0f2f5;
				border-top: 1px solid #d1d7db;
			}

			.light-theme #message-input {
				border: 1px solid #d1d7db;
				color: #111b21;
				background-color: #f0f2f5;
			}

			.light-theme .btn-primary {
				background-color: #00a884;
				border-color: #00a884;
				color: white;
			}

			.light-theme .btn-default {
				background-color: #f0f2f5;
				border-color: #d1d7db;
				color: #54656f;
			}

			.light-theme .message-time {
				color: #667781;
			}

			.light-theme .message-status {
				color: #667781;
			}
			
			.light-theme .date-bubble {
				background-color: white;
				color: #000000;
			}

			.light-theme .send-icon-btn {
				color: #000000;
			}

			.light-theme .attach-file-btn {
				color: #000000;
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
						<button class="new-contact-btn" title="New chat"><i class="fa fa-plus" aria-hidden="true"></i></button>
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
							<button id="theme-toggle" class="theme-btn" title="Toggle theme">
								<i class="fa fa-moon-o" aria-hidden="true"></i>
							</button>
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
		
		this.add_styles();
		this.setup_events();
		this.setup_mobile_toggler();
		this.setup_refresh_button();
		this.setup_file_upload();
		
		// Add event for the fullscreen toggle button in the header
		$('#fullscreen-toggle').on('click', () => {
			this.toggle_fullscreen();
			
			// Change icon based on fullscreen state
			if ($('.navbar').is(':visible')) {
				$('#fullscreen-toggle i').removeClass('fa-compress').addClass('fa-expand');
			} else {
				$('#fullscreen-toggle i').removeClass('fa-expand').addClass('fa-compress');
			}
		});
	}

	showContactLoadingSpinner() {
		$('.current-contact').html('<div class="text-center"><i class="fa fa-spinner fa-spin"></i> Loading...</div>');
	}
	  
	
	setup_refresh_button() {
		const self = this;
		
		// Add click event for refresh button
		$('#refresh-button').on('click', function() {
			self.refresh_all();
		});
	}
	
	refresh_all() {
		// Clear all messages in the current chat
		$('.chat-messages').empty();				

		// Hide the send button if it's visible
		$('#send-button').hide();
		this.showContactLoadingSpinner();		
		
		// Reload the contact list
		this.load_contacts();

		// setTimeout(() => {
		// 	$('.contact-item').first().trigger('click');
		// }, 90);
		
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
			// 1. Normal search in name
			// 2. Normal search in original number with spaces
			// 3. No-space search in no-space number
			// 4. No-space search in original number with spaces
			// 5. Search with spaces in no-space number
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
		
		// Add styles for the placeholder
		if (!$('#no-chat-styles').length) {
			$('<style id="no-chat-styles">').text(`
				.no-chat-selected {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					height: 100%;
					color: #8696a0;
					text-align: center;
					padding: 20px;
				}
				.no-chat-icon {
					font-size: 72px;
					margin-bottom: 20px;
					color: #00a884;
					opacity: 0.8;
				}
				.no-chat-selected h3 {
					font-size: 20px;
					margin-bottom: 10px;
					color: #d1d7db;
				}
				.no-chat-selected p {
					font-size: 14px;
					max-width: 450px;
					color: #8696a0;
				}
			`).appendTo('head');
		}
		
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
					${contact.name === "Unknown" 
						? `<div class="contact-number">${formatPhoneNumber(contact.number)}</div>`
						: `<div class="contact-name">${contact.name}</div>`
					}
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

		// Select the first contact by default
		// if (contacts.length > 0) {
		// 	$('.contact-item').first().trigger('click');
		// }
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
					
					// Add styles for empty chat
					if (!$('#empty-chat-styles').length) {
						$('<style id="empty-chat-styles">').text(`
							.empty-chat-icon {
								font-size: 48px;
								color: #00a884;
								opacity: 0.7;
							}
						`).appendTo('head');
					}
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
				if (msg.content_type === 'image') {
					wrappedTemplate += `<div><img src="${msg.attach}" style="max-width: 100%; height: auto; margin-bottom: 5px;" /></div>`;
				} else if (['document', 'audio', 'video'].includes(msg.content_type)) {
					wrappedTemplate += `<div style="margin-bottom: 5px;">
						<a href="${msg.attach}" target="_blank" style="color: #53BDEB;">
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
	
			// Add click handler for dropdown toggle
			messageItem.find('.message-dropdown-toggle').on('click', function(e) {
				e.stopPropagation();
				
				// Close all other open dropdown menus first
				$('.message-dropdown-menu').not($(this).siblings('.message-dropdown-menu')).removeClass('show');
				$('.message-dropdown').not($(this).parent()).removeClass('active');
				
				// Toggle this dropdown menu
				$(this).siblings('.message-dropdown-menu').toggleClass('show');
				$(this).parent('.message-dropdown').toggleClass('active');
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
			// Only close dropdowns if the click is outside the dropdown
			if ($(e.target).closest('.message-dropdown').length === 0) {
				$('.message-dropdown-menu').removeClass('show');
				$('.message-dropdown').removeClass('active');
			}
		});
	
		// Add style for date separators, dropdown menu, and reactions
		if (!$('#message-dropdown-styles').length) {
			$('<style id="message-dropdown-styles">').text(`
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
	
				/* Dropdown styles */
				.message-dropdown {
					position: absolute;
					top: 5px;
					right: 5px;
					opacity: 0;
					transition: opacity 0.2s;
					z-index: 10;
				}
				.message:hover .message-dropdown {
					opacity: 1;
				}
				.message-dropdown.active .message-dropdown-toggle {
					color: white; /* Change color when active */
				}
				.message-dropdown-toggle {
					color: #8696a0;
					cursor: pointer;
					padding: 4px 6px;
					font-size: 12px;
					background-color: rgba(35, 45, 54, 1); /* Semi-transparent background */
					border-radius: 25%;
					box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4); /* Shadow for visibility */
					display: inline-flex;
					justify-content: center;
					align-items: center;
					width: 22px;
					height: 22px;
				}
				.message-dropdown-menu {
					display: none;
					position: absolute;
					right: 0;
					background-color: #233138;
					border-radius: 6px;
					min-width: 160px;
					box-shadow: 0 2px 10px rgba(0,0,0,0.3);
					z-index: 100;
				}
				.message-dropdown-menu.show {
					display: block;
				}
				.message-dropdown-item {
					padding: 8px 15px;
					color: #ffffff;
					cursor: pointer;
					font-size: 14px;
					white-space: nowrap; /* Allow wrapping */
				}
				.message-dropdown-item:hover {
					background-color: #202c33;
					border-radius: 6px;
				}
				.message-dropdown-item i {
					margin-right: 8px;
					color: #8696a0;
				}
				.delete-message:hover i {
					color: #F15C6D;
				}
	
				/* Adjust message styles for dropdown icon */
				.message {
					position: relative;
					padding-right: 20px;
				}
				
				/* Reaction styles */
				.message-reactions {
					display: flex;
					flex-wrap: wrap;
					gap: 4px;
					margin-top: 2px;
					margin-left: 8px;
					margin-right: 8px;
				}
				
				.reaction-bubble {
					font-size: 1rem;
					background-color: #202c33;
					padding: 3px 6px;
					border-radius: 12px;
					box-shadow: 0 1px 2px rgba(0,0,0,0.2);
					display: inline-flex;
					align-items: center;
					justify-content: center;
				}
				
				.own-reaction {
					cursor: pointer;
					position: relative;
				}
				
				.own-reaction:hover {
					background-color: #293540;
				}
				
				.own-reaction:hover::after {
					content: 'Delete';
					position: absolute;
					top: -20px;
					left: 50%;
					transform: translateX(-50%);
					background-color: #202c33;
					color: #8696a0;
					font-size: 0.7rem;
					padding: 2px 5px;
					border-radius: 4px;
					white-space: nowrap;
				}
			`).appendTo('head');
		}
	
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
				const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
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
					method: 'frappe.client.get_value',
					args: {
					  doctype: 'WhatsApp Templates',
					  filters: { name: this.value },
					  fieldname: ['sample_values', 'template_name']
					},
					callback: function(r) {
					  if (r.message && r.message.sample_values) {
						// Parse sample values to determine how many variables are needed
						let sampleValues;
						try {
						  sampleValues = JSON.parse(r.message.sample_values);
						} catch (e) {
						  sampleValues = {};
						}
						
						const variables = Object.keys(sampleValues);
						
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
						// Hide document selection fields if no sample values
						dialog.set_df_property('reference_doctype_section', 'hidden', 1);
						dialog.set_df_property('reference_doctype', 'hidden', 1);
						dialog.set_df_property('reference_name', 'hidden', 1);
						dialog.set_df_property('custom_data', 'hidden', 1);
						dialog.set_df_property('field_mapping_section', 'hidden', 1);
					  }
					}
				  });
				}
			  }
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
			  hidden: 1
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
				  fieldname: 'docfield',
				  fieldtype: 'Autocomplete',
				  label: 'Document Field',
				  in_list_view: 1,
				  options: []
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
			  reference_name: values.reference_name || null
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


	