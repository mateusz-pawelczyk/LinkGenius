import { App, Plugin, PluginSettingTab, Setting, MarkdownView, TFile } from 'obsidian';
import { Trie } from './Trie';
import { InteractiveTrie } from './InteractiveTrie';

export default class LinkForge extends Plugin {
	private pageLinks: Map<string, string>;
	private isReplacing: boolean = false;
	private trie: InteractiveTrie;

	async onload() {
		console.log('Loading LinkForge plugin');

		// Initialize the pageLinks map
		this.pageLinks = new Map<string, string>();

		this.trie = new InteractiveTrie();

		// Populate the pageLinks map with existing page titles
		await this.initializePageLinks();

		// Register the event listener for text input
		this.registerEvent(
			this.app.workspace.on('editor-change', this.onEditorChange.bind(this))
		);

		this.registerDomEvent(document, 'keydown', this.onKeyDown.bind(this));


		// Register the event listener for page open or tab switch
		this.registerEvent(
			this.app.workspace.on('active-leaf-change', this.onPageOpen.bind(this))
		);
	}

	async initializePageLinks() {
		const files = this.app.vault.getMarkdownFiles();
		files.forEach((file) => {
			const fileName = file.basename;
			this.trie.insert(fileName);
		});
	}

	replaceLinks(str: string) {
		var newStr = "";
		var brackets = 0;
		var currentWord = "";

		str.split('').forEach((char, index) => {

			if (this.trie.isCurrentEndOfWord() && brackets < 2 && !(str.length > index + 1 && !str[index + 1].match(/[a-zA-Z0-9]/))) {
				newStr = newStr.slice(0, -currentWord.length);
				newStr += `[[${currentWord}]]`;
				newStr += char;
			}
			else {
				newStr += char;
			}


			if (brackets == 1 && char != '[' && char != ']') {
				brackets = 0;
			}
			if (char === '[') {
				brackets++;
			}
			else if (char === ']') {
				brackets--;
			}

			currentWord = this.trie.insertChar(char);
		});

		return newStr;
	}

	onEditorChange(editor: any, markdownView: MarkdownView) {
		// Avoid recursive replacements
		if (this.isReplacing) return;


		const cursor = editor.getCursor();
		const line = editor.getLine(cursor.line);

		this.trie.reset();

		const newLine = this.replaceLinks(line);
		if (newLine !== line) {
			editor.setLine(cursor.line, newLine);
		}
	}

	onKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			const activeLeaf = this.app.workspace.activeLeaf;
			if (activeLeaf) {
				const view = activeLeaf.view;
				if (view instanceof MarkdownView) {
					const editor = view.editor;
					const cursor = editor.getCursor();
					if (cursor.line > 0) { // Ensure we are not at the first line
						const previousLineText = editor.getLine(cursor.line - 1);
						this.trie.reset();

						var newLine = this.replaceLinks(previousLineText + " ");
						newLine = newLine.slice(0, -1); // Remove the extra space added
						if (newLine !== previousLineText) {
							editor.setLine(cursor.line - 1, newLine);
						}
					}
				}
			}
		}
	}

	async onPageOpen() {
		await this.initializePageLinks();
		const file = this.app.workspace.getActiveFile();
		if (file) {
			const fileContent = await this.app.vault.read(file);
			this.replacePageTitlesWithLinks(file, fileContent);
		}
	}

	async replacePageTitlesWithLinks(file: TFile, content: string) {
		this.trie.reset();

		const updatedContent = this.replaceLinks(content);

		await this.app.vault.modify(file, updatedContent);
	}

	onunload() {
		console.log('Unloading LinkForge plugin');
	}
}
