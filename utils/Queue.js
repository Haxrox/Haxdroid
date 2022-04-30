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
        return this.Head?.Data;
    }

    Push(data) {
        if (!this.Tail) {
            this.Tail = new Node(data);
            this.Head = this.Tail;
        } else {
            this.Tail.Next = new Node(data);
            this.Tail = this.Tail.Next;
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

    Concat(queue) {
        var node = queue.Head;
        if (!this.Tail) {
            this.Head = node;
        } else {
            this.Tail.Next = node;
        }
        while (!node?.Next) {
            node = node.next;
        }
        this.Tail = node;
        this.Size += queue.Size;
    }

    Reduce(func, init, maxSize) {
        var node = this.Head;
        var processed = 0;
        while (node != null) {
            const append = func(node.Data);
            if ((init + append).length <= (maxSize - 24)) {
                processed++;
                init += append;
                node = node.Next;
            } else {
                init += ` ${this.Size - processed} more`;
                break;
            }
        }
        return init;
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