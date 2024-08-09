export class TrieNode {
    value: string;
    children: Map<string, TrieNode>;
    isEndOfWord: boolean;

    constructor(value: string) {
        this.value = value;
        this.children = new Map<string, TrieNode>();
        this.isEndOfWord = false;
    }
}

export class Trie {
    root: TrieNode;

    constructor() {
        this.root = new TrieNode("");
    }

    // Method to insert a word into the Trie
    insert(word: string): void {
        let currentNode = this.root;

        for (const char of word) {
            if (!currentNode.children.has(char)) {
                currentNode.children.set(char, new TrieNode(char));
            }
            currentNode = currentNode.children.get(char)!;
        }

        currentNode.isEndOfWord = true;
    }

    // Method to search for a word in the Trie
    search(word: string): boolean {
        let currentNode = this.root;

        for (const char of word) {
            if (!currentNode.children.has(char)) {
                return false;
            }
            currentNode = currentNode.children.get(char)!;
        }

        return currentNode.isEndOfWord;
    }

    // Method to check if a prefix exists in the Trie
    startsWith(prefix: string): boolean {
        let currentNode = this.root;

        for (const char of prefix) {
            if (!currentNode.children.has(char)) {
                return false;
            }
            currentNode = currentNode.children.get(char)!;
        }

        return true;
    }

    // Method to traverse the Trie (DFS)
    traverseDFS(node: TrieNode = this.root, prefix: string = "", callback: (word: string) => void = console.log): void {
        if (node.isEndOfWord) {
            callback(prefix);
        }

        for (const [char, childNode] of node.children) {
            this.traverseDFS(childNode, prefix + char, callback);
        }
    }
}
