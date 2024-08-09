import { Trie, TrieNode } from './Trie';

export class InteractiveTrie extends Trie {
    currentNode: TrieNode;
    currentWord: string;    

    constructor() {
        super();
        this.currentNode = this.root;  
        this.currentWord = ""; 
    }

    insertChar(char: string): string {
        if (this.currentNode.children.has(char)) {
            this.currentNode = this.currentNode.children.get(char)!;
            this.currentWord += char;
            return this.currentWord;
        } 

        if (this.currentNode == this.root) {
            return this.currentWord;
        }

        this.currentWord = "";
        this.currentNode = this.root;
        return this.insertChar(char);
    }

    isCurrentEndOfWord(): boolean {
        return this.currentNode.isEndOfWord;
    }

    getCurrentWord(): string {
        return this.currentWord;
    }

    reset(): void {
        this.currentNode = this.root;
        this.currentWord = "";
    }

}