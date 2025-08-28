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
--data '{
     "token": "8c4aaf0e74fd4338943162b3876b2c7d",
     "dtlid":"1081",
     "where": "PropTypeName=~Gender~"
}'

[ get Ajax ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/getAjax' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=scsvjmlmyltbdc0aial10axa; ASP.NET_SessionId=1tczjeqjqrgqtwjnq22yovtd' \
--data '{
     "token": "8c4aaf0e74fd4338943162b3876b2c7d",
     "dtlid":"1103",
     "where":"1=1",
     "search": ""
}'

[ save page ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/savePage' \
--header 'Content-Type: application/json' \
--data-raw '{
    "data": 
"{\"EMPID\":\"1\",\"EMPCode\":\"00001\",\"CardNo\":\"\",\"BranchID\":\"1\",\"DepartmentID\":\"2\",\"DesignationID\":\"1\",\"JoinDate\":\"1/1/2025 12:00:00 AM\",\"Title\":\"Mr\",\"FirstName\":\"Satishvvbnnnnhn\",\"MiddleName\":\"Kalpeshbhai\",\"LastName\":\"Prajapati\",\"BirthDate\":\"1/1/1980 12:00:00 AM\",\"Gender\":\"M\",\"Religion\":\"Hindu\",\"BloodGroup\":\"AB-\",\"MobileNo\":\"87410256394\",\"MobileNo2\":\"\",\"PhoneNo\":\"9905012345\",\"EmailID\":\"satishk@gmail.com\",\"EmailID2\":\"satish@gmail.com\",\"EmergencyContactNo\":\"0533123456\",\"WebSite\":\"https://dev.com\",\"Disabilities\":\"51\",\"DisabilitiesRemarks\":\"\",\"LinkedIn\":\"satish.linkedin\",\"Facebook\":\"satish80\",\"Twitter\":\"satish1980\",\"Instagram\":\"satish80\",\"GitHub\":\"satishgit80\",\"CurrentAddress\":\"Bodak-dev, Near AMTS Stand, Ahmedabad\",\"CurrentCityID\":\"48428\",\"CurrentDistrict\":\"AHMEDABAD\",\"CurrentState\":\"GUJARAT\",\"CurrentCountry\":\"INDIA\",\"CurrentPin\":\"380054\",\"Address\":\"Bodak-dev, Near AMTS Stand, Ahmedabad\",\"CityID\":\"48428\",\"District\":\"AHMEDABAD\",\"State\":\"GUJARAT\",\"Country\":\"INDIA\",\"Pin\":\"380054\",\"AdharNo\":\"854172653987\",\"PANNo\":\"HGTUG5417H\",\"BankName\":\"HDFC Bank\",\"ACNo\":\"87456125367\",\"IFSCCode\":\"HDFC102310\",\"NameInBankAccount\":\"SATISH KALPESHBHAI PRAJAPATI\",\"PFNo\":\"PFSATISH\",\"ESINo\":\"ESICSATISH\",\"GratutityFormNo\":\"GT123456\",\"Status\":\"A\",\"ResignDate\":\"\",\"ResignReason\":\"\",\"Remarks\":\"\",\"LastDate\":\"\",\"UserID\":\"0\",\"CUID\":\"1\",\"Image\":\"d_logo.png\",\"CDT\":\"1/18/2025 12:00:00 AM\",\"MUID\":\"6\",\"MDT\":\"27-Aug-2025 13:22:37\"}",
 "page": "EmployeeMaster",
"token": "8c4aaf0e74fd4338943162b3876b2c7d"
}'


[ Delete ] 

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/pageDelete' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=1tczjeqjqrgqtwjnq22yovtd' \
--data '{
     "token": "8c4aaf0e74fd4338943162b3876b2c7d",
     "id":"00100",
     "remark":"1=1",
     "page": "EmployeeMaster"
}'

[ Auth ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/pageAuth' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=1tczjeqjqrgqtwjnq22yovtd' \
--data '{
     "token": "8c4aaf0e74fd4338943162b3876b2c7d",
     "id":"00100",
     "remarks":"1=1",
     "page": "EmployeeMaster"
}'


[ DeAuth ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/pageDeAuth' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=1tczjeqjqrgqtwjnq22yovtd' \
--data '{
     "token": "8c4aaf0e74fd4338943162b3876b2c7d",
     "id":"00100",
     "remarks":"1=1",
     "page": "EmployeeMaster"
}'


[ Cancel ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/pageCancel' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=1tczjeqjqrgqtwjnq22yovtd' \
--data '{
     "token": "8c4aaf0e74fd4338943162b3876b2c7d",
     "id":"00100",
     "remarks":"1=1",
     "page": "EmployeeMaster"
}'

