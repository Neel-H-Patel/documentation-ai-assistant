// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const axios = require('axios');
// import filesystem and path modules to read local files 
const fs = require('fs');
const path = require('path');

const { XMLParser } = require('fast-xml-parser');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {

	const res = await axios.get("https://blog.webdevsimplified.com/rss.xml")
	//Replace the Axios request with a synchronous file read using fs.readFileSync. This reads the XML file into a string.
	//const filePath = path.join(__dirname, 'simple.xml'); // Path to your local XML file
	//const xmlData = fs.readFileSync(filePath, 'utf-8');  // Read the file content as a string

	const parser = new XMLParser() 
	//replace xmlData.data with res.data if using axios.get instead of lines 21-22
	const articles = parser.parse(res.data).rss.channel.item.map
	(articles => {
		return {
		label: articles.title, 
		detail: articles.description
	}})
	



	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	//console.log('Congratulations, your extension "customextension" is now active!');
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
   

	const disposable = vscode.commands.registerCommand('customextension.searchWdsBlogExample', async function () {
		//setting note equal to showQuickPick because as soon as someone picks a certain xml data, then it should be set equal to the result 
		const chosen_article = await vscode.window.showQuickPick(articles, { // creates a search bar like window for you to search through the xml data 
		matchOnDetail: true //lets you match the title and the description of the xml data in the search bar 
		})
		console.log("The User chose: ", chosen_article)
	});
	
	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
