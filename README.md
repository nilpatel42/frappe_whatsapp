# Frappe WhatsApp

> **Seamless WhatsApp integration for Frappe** using Meta's official API — no third-party services required.

<table>
  <tr>
    <td align="center" width="50%">
      <a href="https://www.youtube.com/watch?v=nq5Kcc5e1oc">
        <img src="https://img.youtube.com/vi/nq5Kcc5e1oc/0.jpg" alt="WhatsApp Demo" width="100%"/>
      </a>
      <p><strong>WhatsApp Demo</strong></p>
    </td>
    <td align="center" width="50%">
      <a href="https://www.youtube.com/watch?v=TncXQ0UW5UM">
        <img src="http://i.ytimg.com/vi/TncXQ0UW5UM/hqdefault.jpg" alt="Bulk Message Feature Guide" width="100%"/>
      </a>
      <p><strong>Bulk Message Feature Guide</strong></p>
    </td>
  </tr>
</table>
<br>
<div align="center">
  <img src="https://user-images.githubusercontent.com/11792643/203741234-29edeb1b-e2f9-4072-98c4-d73a84b48743.gif" width="600px" />
</div>

## Important Note

If you're not using live credentials, follow [step no 2](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started) to add the test number on Meta to which you're sending messages.

## Chat Application

You can also install [whatsapp_chat](https://frappecloud.com/marketplace/apps/whatsapp_chat) along with this app to send and receive messages like a messenger.

## Installation

### Step 1: Get the App
```bash
bench get-app https://github.com/shridarpatil/frappe_whatsapp
```

### Step 2: Install on Your Site
```bash
bench --site [sitename] install-app frappe_whatsapp
```

## Setting Up WhatsApp Notifications

### 1. Get Your WhatsApp Cloud API Credentials
[Get your WhatsApp Cloud API credentials here](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)

### 2. Enter WhatsApp Credentials in Frappe
<div align="center">
  <img src="https://user-images.githubusercontent.com/11792643/198827382-90283b36-f8ab-430e-a909-1b600d6f5da4.png" width="600px" />
</div>

### 3. Create a Template
<div align="center">
<img src="https://user-images.githubusercontent.com/11792643/198827355-ebf9c113-f39a-4d37-98f7-38f719fb2d1f.png" width="600px" />
</div>

> Supports all **Doc Events**

### 4. Create Notifications
<div align="center">
<img src="https://user-images.githubusercontent.com/11792643/198827295-f6d756a3-6289-40b3-99ea-0394efb61041.png" width="600px" /> 
</div>

## Sending Text Messages

### Sending Without a Template
- Create an entry in the **WhatsApp Message** doctype
- On save, it triggers the WhatsApp API to send the message
<div align="center">
<img src="https://user-images.githubusercontent.com/11792643/211518862-de2d3fbc-69c8-48e1-b000-8eebf20b75ab.png" width="600px" />
</div>

### Receiving Messages via WhatsApp Cloud API
<div align="center">
<img src="https://user-images.githubusercontent.com/11792643/211519625-a528abe2-ba24-46a4-bcbc-170f6b4e27fb.png" width="600px" />

<img src="https://user-images.githubusercontent.com/11792643/211518647-45bfaa00-b06a-49c6-a3b3-3cf801d5ec68.gif" width="600px" /> 
</div>

## Advanced Usage: Custom `_dict()` Template

### Sending a Template Without a Doctype
Useful when you can't pull values directly from a doctype. Define a script and populate the variable `_data_list`:

```python
doc.set("_data_list", data_list)
```

**Example:**<br>
<div align="center">
<img src="https://github.com/user-attachments/assets/7496b081-df2b-41dc-bdcb-ed7e5f464698" width="600px" /> 
</div>

## Setting Up Incoming Messages

1. Set up a webhook on Meta
2. Add a verify token on Meta and update the same in **WhatsApp Settings**
3. Add the webhook URL on Meta:
   ```
   <your-domain>/api/method/frappe_whatsapp.utils.webhook.webhook
   ```
4. Add appropriate webhook fields:
   - `messages` to receive messages
   - Add other required webhook fields

## Upcoming Features

- **Update templates** directly on Facebook Developer Console
- **Display template status** inside Frappe

---

## License
**MIT License** — Free to use and modify.
