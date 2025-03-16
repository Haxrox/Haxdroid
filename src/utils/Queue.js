/**
 * LinkedList Node
 */
class Node {
  /**
   * Creates a node
   * @param {*} data data to store
   * @param {Node} next the next node
   */
  constructor(data, next = null) {
    this.Data = data;
    this.Next = next;
  }
}

/**
 * Queue
 */
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
   * @return {*} the head data
   */
  get() {
    return this.Head?.Data;
  }

  /**
   * Removes the node at the given index
   * @param {Number} index the index of the node to remove
   * @return {*} the data of the removed node
   */
  remove(index) {
    let data = this.Head?.Data;
    if (index === 0) {
      this.Head = this.Head.Next;
    } else {
      let node = this.Head;
      for (let i = 0; i < index - 1; i++) {
        node = node.Next;
      }
      data = node.Next.Data;
      node.Next = node.Next.Next;

      if (!node.Next) {
        this.Tail = node;
      }
    }
    this.Size--;

    if (this.Size === 0) {
      this.Head = null;
      this.Tail = null;
    }
    return data;
  }

  /**
   * Pushes data to the end of the queue
   * @param {*} data the data to push
   */
  push(data) {
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
   * @return {*} the data at the front of the queue
   */
  pop() {
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
  insertFront(data) {
    this.Head = new Node(data, this.Head);
    this.Size++;
  }

  /**
   * Concatenates another queue to the current queue
   * @param {Queue} queue the queue to concatenate
   */
  concat(queue) {
    let node = queue?.Head;
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
   * @param {Function} func callback that parses the data
   * @param {*} init initial value to parse the data
   * @param {*} maxSize maximum size that can be reduced to
   * @return {*} reduces value
   */
  reduce(func, init, maxSize) {
    let node = this.Head;
    let processed = 0;
    let index = 0;
    while (node != null) {
      const append = func(node.Data, index);
      if ((init + append).length <= (maxSize - 24)) {
        processed++;
        init += append;
        node = node.Next;
      } else {
        init += `+ ${this.Size - processed} more`;
        break;
      }
      index++;
    }
    return [processed, init];
  }

  /**
   * Clears the entire queue
   */
  clear() {
    this.Head = null;
    this.Tail = null;
    this.Size = 0;
  }

  /**
   * Gets whether the queue is empty
   * @return {boolean} whether the queue is empty
   */
  empty() {
    return this.Size === 0;
  }
}

module.exports = Queue;
