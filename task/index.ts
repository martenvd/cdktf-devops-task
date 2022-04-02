import path = require("path");
import tl = require("azure-pipelines-task-lib");
import { exec } from 'child_process';

export class cdktftask {
    public static checkIfAzurePythonSdkIsInstalled() {
        return !!tl.which("az", false);
    }

    public static async run() {
        try {
            var command: string | undefined = tl.getInput('command', true);
            var workingDirectory: string | undefined = tl.getInput('workingDirectory', false);
            var azureRmConnection: string = tl.getInput("azureRmConnection", true) || "";
            this.loginAzureRM(azureRmConnection);

            console.log(workingDirectory);
            if (workingDirectory != undefined) {
                exec(`cd ${workingDirectory}`, (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        tl.setResult(tl.TaskResult.Failed, 'Workingdirectory must be a valid directory.');
                        return;
                    }
                    console.log(`stdout: ${stdout}`);
                });
                return;
            }

            if (command != 'diff' && command != 'deploy' && command != 'install' && command != 'destroy') {
                tl.setResult(tl.TaskResult.Failed, 'You need to enter one of the following cdktf commands: install, diff, deploy, destroy');
                return;
            } else if (command == 'install') {
                exec(`sudo npm install --global cdktf-cli@latest`, (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        return;
                    }
                    console.log(`stdout: ${stdout}`);
                });
                return;
            } else {
                exec(`cdktf get && cdktf ${command}`,{cwd: workingDirectory}, (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        return;
                    }
                    console.log(`stdout: ${stdout}`);
                });
            }
    
        }
        catch (err) {
            if (err instanceof Error) {
                tl.setResult(tl.TaskResult.Failed, err.message);
            }
        }
    }


    private static loginAzureRM(connectedService: string) {
        var subscriptionID: string = tl.getEndpointDataParameter(connectedService, "SubscriptionID", true) || "";

        let cliPassword: string = "";
        var servicePrincipalId: string = tl.getEndpointAuthorizationParameter(connectedService, "serviceprincipalid", false) || "";
        var tenantId: string = tl.getEndpointAuthorizationParameter(connectedService, "tenantid", false) || "";
        
        tl.debug('key based endpoint');
        cliPassword = tl.getEndpointAuthorizationParameter(connectedService, "serviceprincipalkey", false) || "";
        
        let escapedCliPassword = cliPassword.replace(/"/g, '\\"');
        tl.setSecret(escapedCliPassword.replace(/\\/g, '\"'));
        //login using svn
        tl.execSync("az", `login --service-principal -u "${servicePrincipalId}" --password="${escapedCliPassword}" --tenant "${tenantId}"`);
     
        //set the subscription imported to the current subscription
        tl.execSync("az", "account set --subscription \"" + subscriptionID + "\"");
    }

}

tl.setResourcePath(path.join(__dirname, "task.json"));

if (!cdktftask.checkIfAzurePythonSdkIsInstalled()) {
    tl.setResult(tl.TaskResult.Failed, tl.loc("AzureSDKNotFound"));
}

cdktftask.run();