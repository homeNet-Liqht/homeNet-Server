const firebaseAdmin = require("firebase-admin");

const serviceAccount = {
  type: "service_account",
  project_id: "homenet-41f42",
  private_key_id: "f02a5474982a0bfce1927fc328f2fa6fa9e22e8e",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDqR+F+bRfM7i2J\nRTufd0pcymC8g/9W+jYMsxPe3NThe/CDbRjrx3IePrKw9JMj2s/a1X/kFD4bkEm2\nEog9wGocvtdXGb1lR2cHBGZQQXKJ5yqoRYrf2N9Mn32nX0hY3SnQqUWzd2mSvG23\nVlqaxzN31CK8LmVeXOxomb3l9D6XCtyB4PUvtRHGxnvYkINTZpXWMpSCEfO6ycgx\nxwQHfXIReuAYS5dQegHjZKda2G3PKjtMSgNM8CADfIClGLic3KsYaBQIVdgunryc\nJLSwYfGFvmm/VGCzkabUNX7iBevJUpcAROyF4f93samw1oG0bIgsVRCDWY2vWIf8\ns7gOsCJNAgMBAAECggEANJOAD+LEohlbf8BZQo6/Ufaa4gOPZIIPaicwEOYnIhkx\n3xS3MIaYXiA88shYUwYSem5KXrGKRJ5LZIBhMdaCGcRcSDA/GED/Zow+t8kQPtFx\necTthxHA/w2V4d9YuZScgzbRrRZhy2vdBXVsLOsCamRhjTCuUBBzf3/tJXN8LmH0\nMWFMBibhIHQH/2Hb9LFyrl2FKJBphHfJbd9gbDXkDzXgsrWP9Shl62RJfY3frkjo\nk63WrFAHq5Ff0oxHI6m/zT9xd01+IPadlE0DCQjGbK1309johkX/SRsY1uL3pQiM\nHUxu6NvECKr/BXN1m8x7nO6YZONuZ8VelxvLsSPGAwKBgQD2Y6wtMyBy5vvf+OXb\nJYnidtnTC4dszRw23YcTmCFhWZatyZnAlw8k0Y7V3gqhLtu5hD35qvvE3ykl3Ebu\nYEQBteiMk+tsIHdfbciG1nyhCgduNh/6qxLEgpc/0JXXV07viIAaqqV3h1R/4sEi\ntw089AjQPdFNAlvlCr/JWvXszwKBgQDza0xDgEkOUc6oGlzI8fgtqYKx/NGy+gN8\nZUAMFUKhXHMaIPtVQ0ACKDCTYGz3FejJx7n6rZzxZfIeEI6SuJTyMchwgl4OZxGJ\nOE5aUqmYRoYN0Mh5cBQxQyfeV8DIWsqNChVjjsJ/ssNlB7ciKxrqYfSocEjc/wsG\naZ8mnseeIwKBgQDnXrXCRC6Gd82yhuIiJmAS35SxEDR9wSZrhx9fEQ7Xge9zBstx\nBOldo8PDpZzJu1zuGvavyxZdy0mymeWp15BFIvNbf1Ql118Bp/AUXrnt56MOpZjm\nJVucWR16+X6cFwqy+LWDVRfI5LY+2UqQNOEjie30zvgKntp4fN2YUeh6FQKBgB23\nrsLa6ZBe+mzZcxRxPgxNEpCqPeuszDomnlAbVFwgzkiVWDnLkQfyYiPL9OGhgh8I\nTDNHeM6b1JhJCy7sa/q5iy/5KoR1ntVy01YBm4Tkrz8Gi0MQJNbyzO4/JmEPfIUF\ngyD5b9NpPqOZ8oiwXIPa26SouKyKUo1A3dY4MkSjAoGBALlw+o7eNV3TLIdHNhu+\njOR1vUlv1N328zGJkm/kYiZ+YtZLwGwaEVhMXcwagDudinKPkfHOfZnPzWNUxJ1/\nT8oZrBEDdMp+4pEln/Mhy//StlOKsGvDMG50JydPE6Nkc/PMn+zElYaZ1q9vPI5n\no9W69eiX63dNY446qH5dErNQ\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-ythss@homenet-41f42.iam.gserviceaccount.com",
  client_id: "111807616464704314212",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-ythss%40homenet-41f42.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
});

module.exports = { firebaseAdmin };
