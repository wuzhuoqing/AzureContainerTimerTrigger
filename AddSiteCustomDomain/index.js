const msRestNodeAuth = require("@azure/ms-rest-nodeauth");
const { WebSiteManagementClient } = require("@azure/arm-appservice");

const AZURE_CLIENT_ID = process.env['AZURE_CLIENT_ID'];
const AZURE_TENANT_ID = process.env['AZURE_TENANT_ID'];
const AZURE_CLIENT_SECRET = process.env['AZURE_CLIENT_SECRET'];
const AZURE_SUBSCRIPTION_ID = process.env['AZURE_SUBSCRIPTION_ID'];
const SITE_RESOURCE_GROUP = process.env['SITE_RESOURCE_GROUP'];
const WEBAPP_NAME = process.env['WEBAPP_NAME'];

async function getWebSiteClient() {
    let creds;
    if (AZURE_CLIENT_SECRET) {
        creds = await msRestNodeAuth.loginWithServicePrincipalSecret(AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID);
    } else {
        creds = await msRestNodeAuth.loginWithVmMSI();
    }
    return new WebSiteManagementClient(creds, AZURE_SUBSCRIPTION_ID);
}

module.exports = async function (context, req) {
    const domainName = (req.body && req.body.name);
    context.log('JavaScript HTTP trigger function setting domain for ', domainName);

    let responseMessage = '';
    if (domainName) {
        const siteClient = await getWebSiteClient();
        const hostBinding = {};
        const updateResponse = await siteClient.webApps.createOrUpdateHostNameBinding(SITE_RESOURCE_GROUP, WEBAPP_NAME, domainName, hostBinding);    
        responseMessage = JSON.stringify(updateResponse);    
    }

    context.res = {
        status: statusCode, /* Defaults to 200 */
        body: responseMessage
    };
}