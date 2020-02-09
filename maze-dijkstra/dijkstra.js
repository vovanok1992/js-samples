class PriorityQueue {
    constructor(){
      this.values = [];
    }
    enqueue(val, priority) {
      this.values.push({val, priority });
      this.sort();
    }
    dequeue() {
      return this.values.shift();
    }
    sort() {
      this.values.sort((a, b) => a.priority - b.priority);
    };
  }

class WeightedGraph {

    /**
     *  In graph theory and computer science, an adjacency list is a collection of unordered lists used to represent a finite graph
     */
    constructor() {
        this.adjacencyList = {};
    }

    /**
     * "Vertex" is a synonym for a node of a graph, i.e., one of the points on which the graph is defined and which may be connected by graph edges. 
     *  
     * Time complexity: O(1)
     */
    addVertex(vertex) {
        if(this.adjacencyList[vertex]) {
            console.warn(`"${vertex}" vertex already present into adjacency list. Overriding ${vertex} `);
        }

        this.adjacencyList[vertex] = [];
    }

    /**
     * For an undirected graph, an unordered pair of nodes that specify a line joining these two nodes are said to form an edge.
     * 
     * Time complexity: O(1)
     */
    addEdge(vertex1, vertex2, weight) {
        if(!this.adjacencyList[vertex1]) {
            console.info(`Creating vertex "${vertex1}"`)
            this.addVertex(vertex1);
        }

        if(!this.adjacencyList[vertex2]) {
            console.info(`Creating vertex "${vertex2}"`)
            this.addVertex(vertex2);
        }

        if (!this.adjacencyList[vertex1].find(el => el.node === vertex2)) {
            this.adjacencyList[vertex1].push({ node: vertex2, weight });
        }

        if (!this.adjacencyList[vertex2].find(el => el.node === vertex1)) {
            this.adjacencyList[vertex2].push({ node: vertex1, weight });
        }        
    }

    // O(|E|)
    removeEdge(vertex1, vertex2) {
        this.adjacencyList[vertex1] = this.adjacencyList[vertex1].filter(val => val !== vertex2);
        this.adjacencyList[vertex2] = this.adjacencyList[vertex2].filter(val => val !== vertex1);
    }

    // O(|V| + |E|)
    removeVertex(vertex) {
        this.adjacencyList[vertex]
            .forEach(vertex2 => this.removeEdge(vertex, vertex2));

        delete this.adjacencyList[vertex];
    }

    /**
     * Breadth-first search (BFS) is an algorithm for traversing or searching tree or graph data structures. 
     * It starts at the tree root and explores all of the neighbor nodes at the present depth prior to moving on to the nodes at the next depth level.
     */
    breadthFirstSearch() {
        const res = [];
        const keys = Object.keys(this.adjacencyList);
        const queue = [keys[0]];
        const visited = { [keys[0]]: true };

        while(queue.length) {
            const node = queue.shift();
            res.push(node);
            this.adjacencyList[node].forEach(vrt => {
                if(!visited[vrt.node]) {
                    visited[vrt.node] = true;
                    queue.push(vrt.node);
                } 
            });
        }

        return res;
    }

    /**
     * Depth-first search (DFS) is an algorithm for traversing or searching tree or graph data structures.
     * The algorithm starts at the root node (selecting some arbitrary node as the root node in the case of a graph)
     * and explores as far as possible along each branch before backtracking.
     */
    depthFirstSearch() {
        const res = [];
        const keys = Object.keys(this.adjacencyList);
        const visited = {};

        const traverse = node => {
            if (!visited[node]) {
                visited[node] = true;
                res.push(node);
                this.adjacencyList[node].forEach(vrt => traverse(vrt.node))
            } 
        }

        traverse(keys[0]);

        return res;
    }

    /**
     * 
     * Dijkstra's algorithm (or Dijkstra's Shortest Path First algorithm, SPF algorithm)[1] is an algorithm for finding the shortest paths
     * between nodes in a graph, which may represent, for example, road networks. 
     * 
     * It was conceived by computer scientist Edsger W. Dijkstra in 1956 and published three years later.
     */
    dijkstra(from, to) {
           	// 1 declare variables 
        // distance, prev, queue
        const distance = {};
        const prev = {};
        const queue = new PriorityQueue();
    
        // 2 init
        // for reach node in adjacencyList
        // count set it distance to 0 if its a starting node or Infinity in other case
        // set dist map
        // set prev to null
        // enqueue node to PriorityQueue
 
        Object.keys(this.adjacencyList).forEach(node => {
            let dist = from === node ? 0 : Infinity;
            distance[node] = dist;
            prev[node] = null;
            queue.enqueue(node, dist);
        });
        

        // 3 iterate over queue
        // pop curr item
        // iterate over curr adjacencylist
        // count dist using table + weight
        // if dist < than existing intable - override it
        while(queue.values.length > 0) {
            const currNodeValue = queue.dequeue().val;

            this.adjacencyList[currNodeValue].forEach(edge => {
                const candidat = distance[currNodeValue] + edge.weight;
                if(distance[edge.node] > candidat) {
                    distance[edge.node] = candidat;
                    prev[edge.node] = currNodeValue;
                    queue.enqueue(edge.node, candidat);
                }
            })
        }
        
        // 4 calc path using prev nodes table
        let currentNode = to;
        const res = [];
        while(currentNode !== null) {
            res.push(currentNode);
            currentNode = prev[currentNode];
        }
        return res.reverse();
    }
}

window.WeightedGraph = WeightedGraph;
