// DevERP

// Multiple build creation with different Name + icon + package name

// --- android build ----
// gradlew clean
// gradlew generateCodegenArtifactsFromSchema 
// gradlew app:assembleRelease 
// cmd - gradlew assemble[BRAND_NAME]Release

// How to used - .env.clientA and .env.cientB ??

// How to run - clientA and clientB app ??
// gradlew installClientADebug -Pbrand=[BRAND_NAME]


MOBILE APP - API DETAILS 

[ step 1. getLink: ---- ]

curl --location 'https://support.deverp.net/devws/appcode.aspx/getLink' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=hg4u3v1lqcd000cgwcp35vyx' \
--data '{
    "code": "payroll"
}'

[ step 2. setAppID: ---- ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/setAppID' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=zucfpi2splg1hbdky53rtabf' \
--data '{
    "user": "suresh",
    "pass": "suresh",
    "appid": "appid",
    "firebaseid" : "firebaseid",
    "device": "device"
}'

[ step 3. getAuth: ---- ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/getAuth' \
--header 'Content-Type: text/plain' \
--header 'Cookie: ASP.NET_SessionId=zucfpi2splg1hbdky53rtabf' \
--data '{
    "appid":"",
    "device": ""
}'

[ step 4. getMenu: ---- ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/getMenu' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=zucfpi2splg1hbdky53rtabf' \
--data '{
    "token": "54da6bd990954c45a729d29210d23114"
}'

[ step 5. getDB: ---- ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/getDB' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=zucfpi2splg1hbdky53rtabf' \
--data '{
    "token": "54da6bd990954c45a729d29210d23114"
}'

[ step 6. getPage ---- ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/getPage' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=zucfpi2splg1hbdky53rtabf' \
--data '{
    "token": "4203ce36b6a94d8e80bb497b860384c0",
    "page": "PropMst"
}'

[ step 7. getListData ----]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/getListData' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=zucfpi2splg1hbdky53rtabf' \
--data '{
    "token": "4203ce36b6a94d8e80bb497b860384c0",
    "page": "PropMst", "fd":"01-Apr-2024","td":"31-Aug-2025"
}'


[ Attandanced - punch in]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/punhin' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=scsvjmlmyltbdc0aial10axa' \
--data '{
  "token": "51b35f3b6af242898bfc397607aad328",
  "page": "punhin",
  "data": "{\"ID\":\"51b35f3b6af242898bfc397607aad328\", \"EmployeeId\":\"51b35f3b6af242898bfc397607aad328\",\"InDate\":\"\",\"InImage\":\"\",\"InRemarks\":\"\",\"InLocation\":{\"lat\":\"\",\"long\":\"\"},\"CUID\":\"51b35f3b6af242898bfc397607aad328\"}"
}
'

[ Attandanced - punch out]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/punhout' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=scsvjmlmyltbdc0aial10axa; ASP.NET_SessionId=scsvjmlmyltbdc0aial10axa' \
--data '{
  "token": "51b35f3b6af242898bfc397607aad328",
  "page": "punhout",
  "data": "{\"ID\":\"51b35f3b6af242898bfc397607aad328\", \"EmployeeId\":\"51b35f3b6af242898bfc397607aad328\",\"OutDate\":\"\",\"OutImage\":\"\",\"OutRemarks\":\"\",\"OutLocation\":{\"lat\":\"\",\"long\":\"\"},\"CUID\":\"51b35f3b6af242898bfc397607aad328\"}"
}
'

[ get Drop-down ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/getDDL' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=scsvjmlmyltbdc0aial10axa' \
--data '{
     "token": "51b35f3b6af242898bfc397607aad328",
     "dtlId":"",
     "ddlWhere":""
}'

[ get Ajax ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/getAjax' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=scsvjmlmyltbdc0aial10axa; ASP.NET_SessionId=scsvjmlmyltbdc0aial10axa' \
--data '{
     "token": "51b35f3b6af242898bfc397607aad328",
     "dtlId":"",
     "ddlWhere":""
}'

- air93292