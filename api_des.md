📱 Payroll Mobile App – API Documentation

This API enables authentication, menu fetching, attendance (punch-in/out), and CRUD operations for employee and payroll-related modules.

🔑 Step 1. Get Link

Retrieve the target app link from the central service.

Endpoint:

POST https://support.deverp.net/devws/appcode.aspx/getLink


Headers:

Content-Type: application/json


Request Body:

{
  "code": "payroll"
}


Response Example:

{
  "status": "success",
  "link": "https://payroll.deverp.net"
}

👤 Step 2. Set App ID

Authenticate the user and register the device.

Endpoint:

POST https://payroll.deverp.net/devws/msp_api.aspx/setAppID


Headers:

Content-Type: application/json


Request Body:

{
  "user": "suresh",
  "pass": "suresh",
  "appid": "appid",
  "firebaseid": "firebaseid",
  "device": "device"
}


Response Example:

{
  "status": "success",
  "appid": "generated_app_id",
  "session": "ASP.NET_SessionId=..."
}

🔐 Step 3. Get Auth Token

Obtain a session token for further API access.

Endpoint:

POST https://payroll.deverp.net/devws/msp_api.aspx/getAuth


Headers:

Content-Type: application/json


Request Body:

{
  "appid": "your_appid",
  "device": "your_device"
}


Response Example:

{
  "token": "54da6bd990954c45a729d29210d23114"
}

📋 Step 4. Get Menu

Retrieve available menus for the user.

Endpoint:

POST https://payroll.deverp.net/devws/msp_api.aspx/getMenu


Request Body:

{
  "token": "your_token"
}

🗄 Step 5. Get Database Info

Fetch DB-related details for user.

Endpoint:

POST https://payroll.deverp.net/devws/msp_api.aspx/getDB


Request Body:

{
  "token": "your_token"
}

📑 Step 6. Get Page

Get metadata/schema for a specific page/module.

Endpoint:

POST https://payroll.deverp.net/devws/msp_api.aspx/getPage


Request Body:

{
  "token": "your_token",
  "page": "PropMst"
}

📊 Step 7. Get List Data

Fetch list records between date ranges.

Endpoint:

POST https://payroll.deverp.net/devws/msp_api.aspx/getListData


Request Body:

{
  "token": "your_token",
  "page": "PropMst",
  "fd": "01-Apr-2024",
  "td": "31-Aug-2025"
}

🕒 Attendance – Punch In

Record employee punch-in.

Endpoint:

POST https://payroll.deverp.net/devws/msp_api.aspx/punhin


Request Body:

{
  "token": "your_token",
  "page": "punhin",
  "data": "{\"EmployeeId\":\"EMP123\",\"InDate\":\"2025-08-28 09:00:00\",\"InImage\":\"base64img\",\"InRemarks\":\"Office entry\",\"InLocation\":{\"lat\":\"23.0225\",\"long\":\"72.5714\"},\"CUID\":\"your_token\"}"
}

🕔 Attendance – Punch Out

Record employee punch-out.

Endpoint:

POST https://payroll.deverp.net/devws/msp_api.aspx/punhout


Request Body:

{
  "token": "your_token",
  "page": "punhout",
  "data": "{\"EmployeeId\":\"EMP123\",\"OutDate\":\"2025-08-28 18:00:00\",\"OutImage\":\"base64img\",\"OutRemarks\":\"Leaving office\",\"OutLocation\":{\"lat\":\"23.0225\",\"long\":\"72.5714\"},\"CUID\":\"your_token\"}"
}

⬇️ Get Dropdown Data

Fetch dropdown values for forms.

Endpoint:

POST https://payroll.deverp.net/devws/msp_api.aspx/getDDL


Request Body:

{
  "token": "your_token",
  "dtlid": "1081",
  "where": "PropTypeName=~Gender~"
}

🔍 Get Ajax Data

Fetch dynamic lookup/search data.

Endpoint:

POST https://payroll.deverp.net/devws/msp_api.aspx/getAjax


Request Body:

{
  "token": "your_token",
  "dtlid": "1103",
  "where": "1=1",
  "search": ""
}

💾 Save Page

Save or update employee data.

Endpoint:

POST https://payroll.deverp.net/devws/msp_api.aspx/savePage


Request Body:

{
  "page": "EmployeeMaster",
  "token": "your_token",
  "data": "{...employee json data...}"
}

🗑 Delete Page Record

Delete a record from a page.

Endpoint:

POST https://payroll.deverp.net/devws/msp_api.aspx/pageDelete


Request Body:

{
  "token": "your_token",
  "id": "00100",
  "remark": "Deleted by admin",
  "page": "EmployeeMaster"
}

✅ Page Authorization

Approve (authorize) a record.

POST /pageAuth


Request Body:

{
  "token": "your_token",
  "id": "00100",
  "remarks": "Approved",
  "page": "EmployeeMaster"
}

❌ Page De-Authorization

Revoke approval.

POST /pageDeAuth

🚫 Page Cancel

Cancel a record.

POST /pageCancel

🔄 API Flow Summary

getLink → fetch app URL

setAppID → authenticate user & device

getAuth → generate session token

getMenu / getDB → fetch menu & DB info

getPage / getListData → load module & records

punhin / punhout → attendance marking

getDDL / getAjax → dropdown & lookup data

savePage / pageDelete / pageAuth / pageDeAuth / pageCancel → CRUD & workflow