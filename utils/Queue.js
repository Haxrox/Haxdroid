class Node {
    /**
     * Creates a node
     * @param {*} data 
     * @param {Node} next the next node
     */
    constructor(data, next = null) {
        this.Data = data;
        this.Next = next;
    }
}

class Queue {
    /**
     * Creates a queue
     */
    constructor() {
        this.Head = null;
        this.Tail = null;
        this.Size = 0;
    }

    /**
     * Gets the data of the head
     * @returns the head data
     */
    Get() {
        return this.Head?.Data;
    }

    /**
     * Pushes data to the end of the queue
     * @param {*} data the data to push
     */
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

    /**
     * Removes the front of the queue and returns the data
     * @returns the data at the front of the queue
     */
    Pop() {
        const data = this.Head?.Data;
        this.Head = this.Head?.Next;

        if (!this.Head) {
            this.Tail = null;
        }
        
        this.Size--;
        return data;
    }

    /**
     * Inserts data at the front of the queue
     * @param {*} data 
     */
    InsertFront(data) {
        this.Head = new Node(data, this.Head);
        this.Size++;
    }

    /**
     * Concatenates another queue to the current queue
     * @param {Queue} queue the queue to concatenate
     */
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

    /**
     * Reduces the queue to a single value
     * @param {Function} func the callback to parse the data that takes in a single value
     * @param {*} init the initial value to parse the data
     * @param {*} maxSize the maximum size that can be reduced
     * @returns the reduces value
     */
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
        return [processed, init];
    }

    /**
     * Clears the entire queue
     */
    Clear() {
        this.Head = null;
        this.Tail = null;
        this.Size = 0;
    }

    /**
     * Gets whether the queue is empty
     * @returns whether the queue is empty
     */
    Empty() {
        return this.Size === 0;
    }
}

module.exports = Queue;