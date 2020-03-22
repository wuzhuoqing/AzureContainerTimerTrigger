const msRestNodeAuth = require("@azure/ms-rest-nodeauth");
const { ContainerInstanceManagementClient } = require ("@azure/arm-containerinstance");

const AZURE_CLIENT_ID = process.env['AZURE_CLIENT_ID'];
const AZURE_TENANT_ID = process.env['AZURE_TENANT_ID'];
const AZURE_CLIENT_SECRET = process.env['AZURE_CLIENT_SECRET'];
const AZURE_SUBSCRIPTION_ID = process.env['AZURE_SUBSCRIPTION_ID'];
const CONTAINER_RESOURCE_GROUP = process.env['CONTAINER_RESOURCE_GROUP'];
const CONTAINER_GROUP_NAME = process.env['CONTAINER_GROUP_NAME'];

async function getContainerClient() {
    let creds;
    if (AZURE_CLIENT_SECRET) {
        creds = await msRestNodeAuth.loginWithServicePrincipalSecret(AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID);
    } else {
        creds = await msRestNodeAuth.loginWithVmMSI();
    }
    const client = new ContainerInstanceManagementClient(creds, AZURE_SUBSCRIPTION_ID);
    return client;
}

// curl --request POST -H "Content-Type:application/json" --data "{'input':'sample queue data'}" http://localhost:7071/admin/functions/ContainerTimerTrigger
module.exports = async function (context, myTimer) {
    var timeStamp = new Date().toISOString();
    
    if (myTimer.IsPastDue)
    {
        context.log('JavaScript is running late!');
    }
    const client = await getContainerClient();
    const lroPoller = await client.containerGroups.beginStart(CONTAINER_RESOURCE_GROUP, CONTAINER_GROUP_NAME);
    const response = lroPoller.getInitialResponse();
    context.log('trigger function finish with', response.status, response.bodyAsText);   
};