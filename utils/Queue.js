class Node {
    constructor(data, next = null) {
        this.Data = data;
        this.Next = next;
    }
}

class Queue {
    constructor() {
        this.Head = null;
        this.Tail = null;
        this.Size = 0;
    }

    Get() {
        return this.Head;
    }

    Push(data) {
        if (!this.Tail) {
            this.Tail = new Node(data);
            this.Head = this.Tail;
        } else {
            this.Tail.Next = new Node(data);
        }
        this.Size++;
    }

    Pop() {
        const data = this.Head?.Data;
        this.Head = this.Head?.Next;

        if (!this.Head) {
            this.Tail = null;
        }
        
        this.Size--;
        return data;
    }

    InsertFront(data) {
        this.Head = new Node(data, this.Head);
        this.Size++;
    }

    Clear() {
        this.Head = null;
        this.Tail = null;
        this.Size = 0;
    }

    Empty() {
        return this.Size === 0;
    }
}

module.exports = Queue;