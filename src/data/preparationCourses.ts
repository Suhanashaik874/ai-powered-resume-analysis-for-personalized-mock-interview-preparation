export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Lesson {
  title: string;
  content: string;
  keyPoints: string[];
  example?: string;
  realWorldScenario?: string;
  quiz?: QuizQuestion[];
}

export interface Topic {
  id: string;
  title: string;
  desc: string;
  difficulty: "Easy" | "Medium" | "Hard";
  lessons: Lesson[];
}

export interface CourseCategory {
  id: string;
  category: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  color: string;
  border: string;
  topics: Topic[];
}

export const preparationCourses: CourseCategory[] = [
  {
    id: "coding",
    category: "Coding Prep",
    icon: "FileCode2",
    iconColor: "text-brand-cyan",
    iconBg: "bg-cyan-500/15 border-cyan-500/30",
    color: "from-cyan-500/20 to-blue-600/10",
    border: "border-cyan-500/30 hover:border-cyan-400",
    topics: [
      {
        id: "arrays-strings",
        title: "Arrays & Strings",
        desc: "Master fundamental data manipulation",
        difficulty: "Easy",
        lessons: [
          {
            title: "Introduction to Arrays",
            content: "Arrays are the most fundamental data structure in programming. They store elements in contiguous memory locations, providing O(1) access time by index. Understanding arrays is crucial because they form the basis of many other data structures like heaps, hash tables, and matrices.",
            keyPoints: [
              "Arrays have O(1) random access and O(n) search time",
              "Insertion and deletion at the end is O(1), but O(n) in the middle",
              "Arrays are cache-friendly due to contiguous memory allocation",
              "Dynamic arrays (like JavaScript arrays) automatically resize",
              "Multi-dimensional arrays are used for grids, matrices, and game boards"
            ],
            example: "// Two Pointer Technique — finding a pair that sums to target\nfunction twoSum(arr: number[], target: number): [number, number] {\n  let left = 0, right = arr.length - 1;\n  arr.sort((a, b) => a - b);\n  while (left < right) {\n    const sum = arr[left] + arr[right];\n    if (sum === target) return [arr[left], arr[right]];\n    sum < target ? left++ : right--;\n  }\n  return [-1, -1];\n}",
            realWorldScenario: "🏪 E-commerce Product Filtering: When a user applies price range filters on Amazon, the backend often uses a sorted array of product prices with two pointers to quickly find products within the range. This avoids scanning all 10M+ products — instead, binary search finds the range boundaries in O(log n).\n\n🎮 Game Leaderboards: Online games like PUBG store player scores in arrays. When rendering the top 100 leaderboard, array indexing gives instant O(1) access to any rank position, making it blazing fast even with millions of players.",
            quiz: [
              { question: "What is the time complexity of accessing an element by index in an array?", options: ["O(n)", "O(log n)", "O(1)", "O(n²)"], correctAnswer: 2, explanation: "Arrays store elements in contiguous memory, so accessing by index is a direct memory address calculation — O(1)." },
              { question: "In the two-pointer technique for a sorted array, what happens when the sum is less than the target?", options: ["Move right pointer left", "Move left pointer right", "Reset both pointers", "Swap the pointers"], correctAnswer: 1, explanation: "If the sum is too small, we need a larger value, so we move the left pointer right to increase the sum." },
              { question: "Why are arrays considered cache-friendly?", options: ["They use less memory", "Elements are stored in contiguous memory locations", "They have O(1) deletion", "They are immutable"], correctAnswer: 1, explanation: "Contiguous memory allocation means accessing one element loads nearby elements into the CPU cache, making sequential access very fast." }
            ]
          },
          {
            title: "String Manipulation Patterns",
            content: "Strings are immutable sequences of characters. Many interview problems involve pattern matching, substring searches, and character frequency analysis. The sliding window technique is particularly powerful for string problems, and understanding string hashing can unlock efficient solutions.",
            keyPoints: [
              "Strings are immutable in most languages — modifications create new strings",
              "Use hash maps for character frequency counting",
              "Sliding window technique works well for substring problems",
              "Two-pointer approach is effective for palindrome checks",
              "StringBuilder/array join is more efficient than string concatenation in loops",
              "Regular expressions are powerful but can be slow for complex patterns"
            ],
            example: "// Sliding Window — longest substring without repeating characters\nfunction lengthOfLongestSubstring(s: string): number {\n  const seen = new Map<string, number>();\n  let maxLen = 0, start = 0;\n  for (let end = 0; end < s.length; end++) {\n    if (seen.has(s[end]) && seen.get(s[end])! >= start) {\n      start = seen.get(s[end])! + 1;\n    }\n    seen.set(s[end], end);\n    maxLen = Math.max(maxLen, end - start + 1);\n  }\n  return maxLen;\n}",
            realWorldScenario: "🔐 Password Validation: Applications like Gmail use string pattern matching to enforce password rules — checking for uppercase, lowercase, digits, special chars, and minimum length. Character frequency counting ensures variety.\n\n🔍 Autocomplete/Search Suggestions: When you type in Google Search, the sliding window technique helps match partial substrings against millions of search queries. The Trie data structure (built from strings) powers the suggestion engine, returning results in milliseconds.",
            quiz: [
              { question: "Why is string concatenation in a loop inefficient?", options: ["Strings are mutable", "Each concatenation creates a new string object", "Strings can't be looped", "It causes memory leaks"], correctAnswer: 1, explanation: "Strings are immutable — each concatenation creates a new string, copying all previous characters. Use StringBuilder or array join instead." },
              { question: "What technique is best for finding the longest substring without repeating characters?", options: ["Binary search", "Sliding window", "Divide and conquer", "Dynamic programming"], correctAnswer: 1, explanation: "The sliding window technique maintains a window of unique characters, expanding and contracting as needed — O(n) time." }
            ]
          },
          {
            title: "Common Array Algorithms",
            content: "Several classic algorithms frequently appear in interviews. These include Kadane's algorithm for maximum subarray sum, the Dutch National Flag problem for sorting, prefix sum techniques for range queries, and the Boyer-Moore voting algorithm for finding majority elements.",
            keyPoints: [
              "Kadane's Algorithm: O(n) max subarray sum — used in stock trading problems",
              "Prefix Sum: Precompute cumulative sums for O(1) range queries",
              "Dutch National Flag: Three-way partition in O(n) — sort 0s, 1s, 2s",
              "Boyer-Moore Voting: Find majority element in O(n) time, O(1) space",
              "Reservoir Sampling: Select k random items from a stream of unknown length"
            ],
            example: "// Kadane's Algorithm — Maximum Subarray Sum\nfunction maxSubArray(nums: number[]): number {\n  let maxSum = nums[0], currentSum = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    currentSum = Math.max(nums[i], currentSum + nums[i]);\n    maxSum = Math.max(maxSum, currentSum);\n  }\n  return maxSum;\n}\n\n// Prefix Sum — Range Sum Query\nfunction buildPrefixSum(arr: number[]): number[] {\n  const prefix = [0];\n  for (const num of arr) prefix.push(prefix[prefix.length - 1] + num);\n  return prefix;\n}\nfunction rangeSum(prefix: number[], l: number, r: number): number {\n  return prefix[r + 1] - prefix[l];\n}",
            realWorldScenario: "📈 Stock Trading (Kadane's): Robinhood and trading platforms use Kadane's algorithm to find the maximum profit period — the best time to buy and sell. Given daily price changes as an array, the max subarray sum gives the maximum possible profit.\n\n📊 Analytics Dashboards (Prefix Sum): When Stripe shows 'revenue from day X to day Y', they don't re-sum millions of transactions. A prefix sum array allows any date range query in O(1) — critical when users drag date sliders in real-time.\n\n🗳️ Election Vote Counting (Boyer-Moore): Finding which candidate got the majority vote across billions of ballots. Boyer-Moore does this in a single pass with constant memory."
          },
          {
            title: "Matrix & 2D Array Problems",
            content: "Matrix problems are a staple of coding interviews. They test your ability to navigate 2D space, handle boundaries, and apply BFS/DFS in grid contexts. Common patterns include spiral traversal, rotation, island counting, and shortest path in a grid.",
            keyPoints: [
              "Always check boundary conditions: row >= 0, col >= 0, row < rows, col < cols",
              "Use direction arrays for cleaner traversal: dx = [-1, 1, 0, 0], dy = [0, 0, -1, 1]",
              "Spiral traversal: maintain top/bottom/left/right boundaries",
              "Matrix rotation 90°: transpose then reverse each row",
              "BFS on grid: treat each cell as a graph node with 4 neighbors"
            ],
            example: "// Rotate Matrix 90° Clockwise (in-place)\nfunction rotate(matrix: number[][]): void {\n  const n = matrix.length;\n  // Transpose\n  for (let i = 0; i < n; i++)\n    for (let j = i + 1; j < n; j++)\n      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];\n  // Reverse each row\n  for (const row of matrix) row.reverse();\n}\n\n// Count Islands (BFS)\nfunction numIslands(grid: string[][]): number {\n  let count = 0;\n  const rows = grid.length, cols = grid[0].length;\n  for (let i = 0; i < rows; i++)\n    for (let j = 0; j < cols; j++)\n      if (grid[i][j] === '1') { count++; bfs(grid, i, j); }\n  return count;\n}",
            realWorldScenario: "🗺️ Google Maps (Grid BFS): Finding the shortest path on a map is essentially BFS on a 2D grid. Each tile is a cell, roads are passable cells, and buildings are blocked cells. Google Maps uses advanced versions of this (A* algorithm) for GPS navigation.\n\n📱 Image Processing (Matrix Rotation): When you rotate a photo on Instagram, the underlying pixel matrix is rotated using the transpose + reverse technique. Image filters like blur apply convolution matrices — a 2D array operation on each pixel.\n\n🎮 Minesweeper (Flood Fill): When you click an empty cell in Minesweeper, the game reveals all connected empty cells — this is exactly the island/flood-fill BFS algorithm."
          }
        ]
      },
      {
        id: "linked-lists-stacks",
        title: "Linked Lists & Stacks",
        desc: "Linear data structures deep dive",
        difficulty: "Easy",
        lessons: [
          {
            title: "Linked List Fundamentals",
            content: "Linked lists consist of nodes where each node contains data and a reference to the next node. Unlike arrays, they allow efficient insertion and deletion at any position but sacrifice random access. They're the foundation for implementing stacks, queues, and more complex structures like LRU caches.",
            keyPoints: [
              "Singly linked: each node points to the next",
              "Doubly linked: each node has prev and next pointers",
              "Insertion/deletion is O(1) if you have the node reference",
              "Use a dummy head node to simplify edge cases",
              "Fast & slow pointer (Floyd's) detects cycles and finds midpoints"
            ],
            example: "// Reverse a Linked List\nfunction reverseList(head: ListNode | null): ListNode | null {\n  let prev = null, curr = head;\n  while (curr) {\n    const next = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = next;\n  }\n  return prev;\n}\n\n// Detect Cycle (Floyd's Algorithm)\nfunction hasCycle(head: ListNode | null): boolean {\n  let slow = head, fast = head;\n  while (fast?.next) {\n    slow = slow!.next;\n    fast = fast.next.next;\n    if (slow === fast) return true;\n  }\n  return false;\n}",
            realWorldScenario: "🔄 Browser History (Doubly Linked List): When you click Back/Forward in Chrome, you're traversing a doubly linked list. Each page visit adds a node. 'Back' moves to the previous node, 'Forward' to the next. If you navigate to a new page, all 'forward' nodes are removed.\n\n💾 LRU Cache (Linked List + HashMap): Every operating system uses an LRU (Least Recently Used) cache to manage memory pages. A doubly linked list tracks access order — the most recently used item moves to the front, and when memory is full, the tail (least recently used) gets evicted. Redis implements this exact pattern."
          },
          {
            title: "Stack Applications",
            content: "Stacks follow LIFO (Last In, First Out) principle. They are essential for expression evaluation, backtracking algorithms, and maintaining state history. The call stack itself is the most well-known stack. Monotonic stacks are an advanced pattern that solves 'next greater element' problems efficiently.",
            keyPoints: [
              "LIFO: Last In, First Out ordering",
              "Common uses: undo functionality, expression parsing, DFS",
              "Monotonic stack solves next greater/smaller element problems",
              "Use stacks for matching brackets and parentheses",
              "Min stack: track minimum element at each level in O(1)"
            ],
            example: "// Valid Parentheses\nfunction isValid(s: string): boolean {\n  const stack: string[] = [];\n  const map: Record<string, string> = { ')': '(', ']': '[', '}': '{' };\n  for (const char of s) {\n    if ('({['.includes(char)) stack.push(char);\n    else if (stack.pop() !== map[char]) return false;\n  }\n  return stack.length === 0;\n}\n\n// Next Greater Element (Monotonic Stack)\nfunction nextGreater(arr: number[]): number[] {\n  const result = new Array(arr.length).fill(-1);\n  const stack: number[] = [];\n  for (let i = arr.length - 1; i >= 0; i--) {\n    while (stack.length && stack[stack.length-1] <= arr[i]) stack.pop();\n    if (stack.length) result[i] = stack[stack.length-1];\n    stack.push(arr[i]);\n  }\n  return result;\n}",
            realWorldScenario: "⬅️ Undo/Redo in Text Editors (Stack): VS Code, Google Docs, and Photoshop all use two stacks — one for undo, one for redo. Every action pushes to the undo stack. When you press Ctrl+Z, the action pops from undo and pushes to redo. Ctrl+Y reverses this.\n\n🏗️ Code Compilation (Parentheses Matching): Compilers like GCC and TypeScript's tsc use stacks to match opening and closing braces, brackets, and parentheses. If the stack isn't empty at the end, it's a syntax error — this is exactly the 'Valid Parentheses' problem.\n\n📊 Stock Span Problem (Monotonic Stack): Financial apps calculate 'stock span' — how many consecutive days before today had a lower price. This is the classic monotonic stack use case, processing millions of data points efficiently."
          },
          {
            title: "Queue & Deque Patterns",
            content: "Queues follow FIFO (First In, First Out) principle, making them ideal for breadth-first processing, task scheduling, and buffering. Deques (double-ended queues) allow insertion and removal from both ends, enabling the sliding window maximum pattern.",
            keyPoints: [
              "FIFO: First In, First Out — like a real-world queue",
              "BFS always uses a queue for level-order traversal",
              "Priority Queue (Heap): Process highest/lowest priority first",
              "Deque: Sliding window maximum/minimum in O(n)",
              "Circular Queue: Fixed-size buffer that wraps around"
            ],
            example: "// Sliding Window Maximum using Deque\nfunction maxSlidingWindow(nums: number[], k: number): number[] {\n  const result: number[] = [];\n  const deque: number[] = []; // stores indices\n  for (let i = 0; i < nums.length; i++) {\n    // Remove elements outside window\n    while (deque.length && deque[0] < i - k + 1) deque.shift();\n    // Remove smaller elements from back\n    while (deque.length && nums[deque[deque.length-1]] < nums[i]) deque.pop();\n    deque.push(i);\n    if (i >= k - 1) result.push(nums[deque[0]]);\n  }\n  return result;\n}",
            realWorldScenario: "🖨️ Print Queue (FIFO Queue): Every office printer maintains a queue of print jobs. The first document sent prints first. If the queue is full, new jobs wait. This is a classic circular buffer implementation.\n\n🚗 Ride-Sharing Dispatch (Priority Queue): When you request an Uber, a priority queue ranks nearby drivers by distance, rating, and availability. The driver with the highest priority gets the request first. The heap-based priority queue processes this in O(log n).\n\n📱 Notification Systems (Message Queue): WhatsApp uses message queues (like Kafka) to deliver billions of messages daily. Messages are queued per recipient and delivered FIFO when they come online."
          }
        ]
      },
      {
        id: "trees-graphs",
        title: "Trees & Graphs",
        desc: "Hierarchical & network structures",
        difficulty: "Medium",
        lessons: [
          {
            title: "Binary Trees & Traversals",
            content: "Binary trees are hierarchical structures where each node has at most two children. Tree traversals (inorder, preorder, postorder) are fundamental operations. BSTs maintain sorted order for efficient search. Understanding recursive tree solutions is a key interview skill.",
            keyPoints: [
              "Inorder traversal of BST gives sorted order",
              "BFS uses a queue; DFS uses recursion or a stack",
              "Height-balanced trees ensure O(log n) operations",
              "Common problems: LCA, diameter, max depth, path sum",
              "Serialize/deserialize trees for network transfer"
            ],
            example: "// Inorder Traversal (Iterative)\nfunction inorder(root: TreeNode | null): number[] {\n  const result: number[] = [], stack: TreeNode[] = [];\n  let curr = root;\n  while (curr || stack.length) {\n    while (curr) { stack.push(curr); curr = curr.left; }\n    curr = stack.pop()!;\n    result.push(curr.val);\n    curr = curr.right;\n  }\n  return result;\n}\n\n// Maximum Depth of Binary Tree\nfunction maxDepth(root: TreeNode | null): number {\n  if (!root) return 0;\n  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));\n}",
            realWorldScenario: "📁 File System (Tree Structure): Your computer's file system is a tree. The root directory '/' is the root node. Each folder is an internal node, and files are leaves. Commands like 'find' and 'ls -R' perform DFS traversal. The total folder size calculation uses postorder traversal — compute children sizes first, then sum.\n\n🏢 Organization Hierarchy: Company org charts are trees. Finding the 'Lowest Common Ancestor (LCA)' of two employees tells you their shared manager — used in Slack/Teams to determine communication hierarchies and access permissions."
          },
          {
            title: "Graph Algorithms",
            content: "Graphs model relationships between entities. BFS finds shortest paths in unweighted graphs, while DFS is useful for cycle detection and topological sorting. Understanding adjacency lists and matrices is essential. Real-world networks like social media, maps, and the internet are all graphs.",
            keyPoints: [
              "BFS: Level-order, shortest path in unweighted graphs",
              "DFS: Cycle detection, connected components, topological sort",
              "Dijkstra's: Shortest path in weighted graphs with non-negative edges",
              "Union-Find: Efficient connected component tracking",
              "Topological Sort: Task scheduling with dependencies"
            ],
            example: "// BFS — Shortest Path\nfunction bfs(graph: Map<number, number[]>, start: number, end: number): number {\n  const queue: [number, number][] = [[start, 0]];\n  const visited = new Set([start]);\n  while (queue.length) {\n    const [node, dist] = queue.shift()!;\n    if (node === end) return dist;\n    for (const neighbor of graph.get(node) || []) {\n      if (!visited.has(neighbor)) {\n        visited.add(neighbor);\n        queue.push([neighbor, dist + 1]);\n      }\n    }\n  }\n  return -1;\n}\n\n// Topological Sort (Kahn's Algorithm)\nfunction topSort(n: number, edges: [number, number][]): number[] {\n  const indegree = new Array(n).fill(0);\n  const adj = Array.from({length: n}, () => [] as number[]);\n  for (const [u, v] of edges) { adj[u].push(v); indegree[v]++; }\n  const queue = indegree.reduce((q, d, i) => d === 0 ? [...q, i] : q, [] as number[]);\n  const order: number[] = [];\n  while (queue.length) {\n    const node = queue.shift()!;\n    order.push(node);\n    for (const next of adj[node]) if (--indegree[next] === 0) queue.push(next);\n  }\n  return order.length === n ? order : []; // empty = cycle\n}",
            realWorldScenario: "🗺️ Google Maps Navigation (Dijkstra's): When you ask for driving directions, Google Maps models the road network as a weighted graph. Intersections are nodes, roads are edges, and weights are travel times. Dijkstra's algorithm (with A* optimization) finds the fastest route.\n\n👥 LinkedIn 'People You May Know' (BFS): LinkedIn uses BFS from your profile to find 2nd and 3rd-degree connections. Friends-of-friends at distance 2 are strong suggestions. This graph traversal runs on a social graph with 900M+ nodes.\n\n📦 Package Managers (Topological Sort): When you run 'npm install', the package manager uses topological sort to determine installation order. Package A depends on B, B depends on C — topological sort gives [C, B, A]. Circular dependencies are detected as cycles."
          },
          {
            title: "Advanced Tree Structures",
            content: "Beyond basic binary trees, several specialized tree structures solve specific problems efficiently. Tries are perfect for string prefix operations, segment trees handle range queries, and AVL/Red-Black trees maintain balance automatically.",
            keyPoints: [
              "Trie: O(L) insert/search for strings of length L — prefix matching",
              "Segment Tree: O(log n) range queries and updates",
              "AVL/Red-Black Tree: Self-balancing BST with O(log n) guaranteed",
              "B-Tree: Optimized for disk reads — used in databases",
              "Heap: Complete binary tree — O(1) min/max, O(log n) insert/delete"
            ],
            example: "// Trie Implementation\nclass TrieNode {\n  children = new Map<string, TrieNode>();\n  isEnd = false;\n}\n\nclass Trie {\n  root = new TrieNode();\n  insert(word: string) {\n    let node = this.root;\n    for (const ch of word) {\n      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());\n      node = node.children.get(ch)!;\n    }\n    node.isEnd = true;\n  }\n  search(word: string): boolean {\n    let node = this.root;\n    for (const ch of word) {\n      if (!node.children.has(ch)) return false;\n      node = node.children.get(ch)!;\n    }\n    return node.isEnd;\n  }\n  startsWith(prefix: string): boolean {\n    let node = this.root;\n    for (const ch of prefix) {\n      if (!node.children.has(ch)) return false;\n      node = node.children.get(ch)!;\n    }\n    return true;\n  }\n}",
            realWorldScenario: "📱 Phone Keyboard Autocomplete (Trie): When you type 'hel' on your phone keyboard, a Trie data structure instantly finds all words starting with 'hel' — hello, help, helmet. Google's search bar uses a distributed Trie serving billions of queries.\n\n🗄️ Database Indexing (B-Tree): Every SQL database (PostgreSQL, MySQL) uses B-Trees for indexes. When you query 'WHERE age > 25 AND age < 30', the B-Tree index finds the range in O(log n) without scanning the entire table. This is why adding an index makes queries 100x faster.\n\n🏆 Tournament Brackets (Heap): Sports tournament brackets are complete binary trees. A max-heap naturally represents a single-elimination tournament — the winner 'bubbles up' to the root. Priority queues in hospitals (triage systems) use heaps to ensure the most critical patients are treated first."
          }
        ]
      },
      {
        id: "dynamic-programming",
        title: "Dynamic Programming",
        desc: "Optimization & memoization patterns",
        difficulty: "Hard",
        lessons: [
          {
            title: "DP Foundations",
            content: "Dynamic programming solves complex problems by breaking them into overlapping subproblems. The two approaches are top-down (memoization) and bottom-up (tabulation). Identifying the state and transition is the key skill. DP is arguably the most important topic for coding interviews at top companies.",
            keyPoints: [
              "Overlapping subproblems + optimal substructure = DP candidate",
              "Top-down: Recursive with memoization cache",
              "Bottom-up: Iterative with tabulation array",
              "State: What information do we need to make a decision?",
              "Transition: How do we go from one state to the next?"
            ],
            example: "// Fibonacci — Bottom-Up DP\nfunction fib(n: number): number {\n  if (n <= 1) return n;\n  let prev = 0, curr = 1;\n  for (let i = 2; i <= n; i++) {\n    [prev, curr] = [curr, prev + curr];\n  }\n  return curr;\n}\n\n// 0/1 Knapsack\nfunction knapsack(weights: number[], values: number[], W: number): number {\n  const n = weights.length;\n  const dp = Array(W + 1).fill(0);\n  for (let i = 0; i < n; i++)\n    for (let w = W; w >= weights[i]; w--)\n      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);\n  return dp[W];\n}",
            realWorldScenario: "🛒 Shopping Cart Optimization (Knapsack): E-commerce platforms solve a variant of the Knapsack problem. Given a budget (weight capacity) and items with prices and satisfaction scores, what's the optimal cart? Amazon's 'Frequently Bought Together' recommendations use similar optimization.\n\n📡 Network Routing (Shortest Path DP): Internet routers use DP-based algorithms (Bellman-Ford) to find the cheapest path for data packets. Each router maintains a distance table that gets updated as network conditions change."
          },
          {
            title: "Classic DP Patterns",
            content: "Most DP problems fall into recognizable patterns. Learning these patterns allows you to map new problems to known solutions. The most common patterns are: Linear DP, Grid DP, String DP, Interval DP, and State Machine DP.",
            keyPoints: [
              "Linear DP: Climbing stairs, house robber, coin change",
              "Grid DP: Unique paths, minimum path sum",
              "String DP: LCS, edit distance, palindrome partitioning",
              "Interval DP: Matrix chain multiplication, burst balloons",
              "State Machine DP: Stock trading with cooldown, regex matching"
            ],
            example: "// Longest Common Subsequence (String DP)\nfunction lcs(s1: string, s2: string): number {\n  const m = s1.length, n = s2.length;\n  const dp = Array.from({length: m + 1}, () => Array(n + 1).fill(0));\n  for (let i = 1; i <= m; i++)\n    for (let j = 1; j <= n; j++)\n      dp[i][j] = s1[i-1] === s2[j-1]\n        ? dp[i-1][j-1] + 1\n        : Math.max(dp[i-1][j], dp[i][j-1]);\n  return dp[m][n];\n}\n\n// Edit Distance (Levenshtein Distance)\nfunction editDistance(word1: string, word2: string): number {\n  const m = word1.length, n = word2.length;\n  const dp = Array.from({length: m + 1}, (_, i) =>\n    Array.from({length: n + 1}, (_, j) => i === 0 ? j : j === 0 ? i : 0)\n  );\n  for (let i = 1; i <= m; i++)\n    for (let j = 1; j <= n; j++)\n      dp[i][j] = word1[i-1] === word2[j-1]\n        ? dp[i-1][j-1]\n        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);\n  return dp[m][n];\n}",
            realWorldScenario: "📝 Spell Check & Autocorrect (Edit Distance): When you misspell 'recieve' in Google Docs, the spell checker uses Edit Distance (Levenshtein Distance) to find the closest valid word — 'receive' is just 1 swap away. This same algorithm powers 'Did you mean...?' in search engines.\n\n🧬 DNA Sequence Alignment (LCS): Bioinformatics heavily uses Longest Common Subsequence to align DNA sequences. When comparing two genomes, LCS identifies shared genetic patterns — crucial for understanding evolution and diagnosing genetic diseases.\n\n🎬 Video Streaming Optimization (Grid DP): Netflix uses DP to optimize video encoding. Given different quality levels and bandwidth constraints across a video timeline, DP finds the optimal quality-per-segment allocation to maximize viewing experience."
          },
          {
            title: "Advanced DP — State Compression & Bitmask",
            content: "When the state space involves subsets (e.g., 'which cities have been visited?'), bitmask DP encodes subsets as integers. This is commonly used in problems involving permutations, the Travelling Salesman Problem, and assignment problems.",
            keyPoints: [
              "Bitmask: Represent a subset of n items as an n-bit integer",
              "Check if item i is in set: (mask >> i) & 1",
              "Add item i to set: mask | (1 << i)",
              "TSP with bitmask: dp[mask][i] = min cost to visit cities in 'mask' ending at 'i'",
              "Time complexity: O(2^n × n²) — only feasible for n ≤ 20"
            ],
            example: "// Travelling Salesman Problem (Bitmask DP)\nfunction tsp(dist: number[][]): number {\n  const n = dist.length;\n  const ALL = (1 << n) - 1;\n  const dp = Array.from({length: 1 << n}, () => Array(n).fill(Infinity));\n  dp[1][0] = 0; // Start at city 0\n  for (let mask = 1; mask <= ALL; mask++) {\n    for (let u = 0; u < n; u++) {\n      if (!(mask & (1 << u)) || dp[mask][u] === Infinity) continue;\n      for (let v = 0; v < n; v++) {\n        if (mask & (1 << v)) continue;\n        const newMask = mask | (1 << v);\n        dp[newMask][v] = Math.min(dp[newMask][v], dp[mask][u] + dist[u][v]);\n      }\n    }\n  }\n  return Math.min(...dp[ALL].map((d, i) => d + dist[i][0]));\n}",
            realWorldScenario: "🚚 Delivery Route Optimization (TSP): Companies like FedEx and DoorDash solve variants of TSP daily. A delivery driver has 15 stops — bitmask DP finds the shortest route visiting all stops. For larger problems (100+ stops), they use approximation algorithms.\n\n🏭 Job Assignment Problem: In a factory with n workers and n tasks, bitmask DP finds the optimal assignment minimizing total cost. Each bitmask represents which tasks have been assigned. HR software uses this for shift scheduling."
          }
        ]
      },
      {
        id: "sorting-searching",
        title: "Sorting & Searching",
        desc: "Essential algorithm techniques",
        difficulty: "Medium",
        lessons: [
          {
            title: "Sorting Algorithms",
            content: "Understanding sorting algorithms and their trade-offs is fundamental. Merge sort and quick sort are the most commonly asked in interviews. Knowing when to use counting sort or radix sort for specific constraints is also valuable.",
            keyPoints: [
              "Merge Sort: O(n log n) stable, uses extra space — great for linked lists",
              "Quick Sort: O(n log n) average, in-place, unstable — fastest in practice",
              "Counting Sort: O(n + k) for small range integers — not comparison-based",
              "Radix Sort: O(d × (n + k)) for d-digit numbers",
              "Know the best/worst/average cases for each"
            ],
            example: "// Merge Sort\nfunction mergeSort(arr: number[]): number[] {\n  if (arr.length <= 1) return arr;\n  const mid = Math.floor(arr.length / 2);\n  const left = mergeSort(arr.slice(0, mid));\n  const right = mergeSort(arr.slice(mid));\n  return merge(left, right);\n}\nfunction merge(a: number[], b: number[]): number[] {\n  const result: number[] = [];\n  let i = 0, j = 0;\n  while (i < a.length && j < b.length)\n    result.push(a[i] < b[j] ? a[i++] : b[j++]);\n  return [...result, ...a.slice(i), ...b.slice(j)];\n}\n\n// Quick Sort (Lomuto Partition)\nfunction quickSort(arr: number[], lo = 0, hi = arr.length - 1): number[] {\n  if (lo < hi) {\n    const pivot = arr[hi];\n    let i = lo;\n    for (let j = lo; j < hi; j++)\n      if (arr[j] < pivot) [arr[i], arr[j]] = [arr[j], arr[i++]];\n    [arr[i], arr[hi]] = [arr[hi], arr[i]];\n    quickSort(arr, lo, i - 1);\n    quickSort(arr, i + 1, hi);\n  }\n  return arr;\n}",
            realWorldScenario: "🗂️ Database ORDER BY (Merge Sort): PostgreSQL uses a variant of merge sort for ORDER BY queries because it's stable (preserves order of equal elements) and works well with disk-based data. When sorting 100M rows that don't fit in memory, external merge sort splits data into sorted chunks and merges them.\n\n⚡ V8 Engine Array.sort() (TimSort): JavaScript's Array.sort() in Chrome uses TimSort — a hybrid of merge sort and insertion sort. It exploits naturally occurring sorted runs in real data, making it faster than pure merge sort in practice."
          },
          {
            title: "Binary Search Variations",
            content: "Binary search is not just for sorted arrays. It can be applied to search spaces, rotated arrays, and answer-based problems. The key insight is identifying a monotonic property to binary search on. 'Binary search on answer' is a powerful technique where you binary search the result space.",
            keyPoints: [
              "Classic binary search: O(log n) on sorted arrays",
              "Search in rotated sorted array: modified binary search",
              "Binary search on answer: minimize/maximize a value",
              "Lower/upper bound: find first/last occurrence",
              "Invariant: maintain a property that halves the search space"
            ],
            example: "// Binary Search — First Occurrence\nfunction lowerBound(arr: number[], target: number): number {\n  let lo = 0, hi = arr.length;\n  while (lo < hi) {\n    const mid = (lo + hi) >> 1;\n    arr[mid] < target ? lo = mid + 1 : hi = mid;\n  }\n  return lo;\n}\n\n// Binary Search on Answer — Minimum days to make bouquets\nfunction minDays(bloomDay: number[], m: number, k: number): number {\n  if (m * k > bloomDay.length) return -1;\n  let lo = 1, hi = Math.max(...bloomDay);\n  const canMake = (days: number): boolean => {\n    let bouquets = 0, flowers = 0;\n    for (const d of bloomDay) {\n      flowers = d <= days ? flowers + 1 : 0;\n      if (flowers === k) { bouquets++; flowers = 0; }\n    }\n    return bouquets >= m;\n  };\n  while (lo < hi) {\n    const mid = (lo + hi) >> 1;\n    canMake(mid) ? hi = mid : lo = mid + 1;\n  }\n  return lo;\n}",
            realWorldScenario: "📦 Package Version Resolution (Binary Search): When npm resolves 'package@^2.0.0', it binary searches through sorted version tags to find the latest compatible version. This happens for every dependency in your node_modules.\n\n🏠 Airbnb Price Suggestions (Binary Search on Answer): Airbnb suggests optimal pricing for hosts. Given historical data, they binary search on price points — 'at price X, will we get enough bookings to maximize revenue?' The answer is monotonic (higher price = fewer bookings), making binary search applicable.\n\n📊 Percentile Calculations (Lower/Upper Bound): When a test platform shows 'You scored better than 85% of candidates', they use binary search (lower_bound) on sorted scores to find the percentile rank instantly."
          },
          {
            title: "Hash Tables & Hashing",
            content: "Hash tables provide O(1) average-case lookups by mapping keys to array indices via a hash function. They're the most frequently used data structure in real-world applications. Understanding collision resolution and load factors is important for interviews.",
            keyPoints: [
              "Average O(1) insert, delete, lookup — worst case O(n) with bad hash",
              "Collision resolution: chaining (linked lists) or open addressing (probing)",
              "Load factor = n/capacity — resize when > 0.75 typically",
              "Two-sum pattern: use hash map to find complement in O(n)",
              "Frequency counting: most common hash table interview pattern"
            ],
            example: "// Two Sum using Hash Map\nfunction twoSum(nums: number[], target: number): number[] {\n  const map = new Map<number, number>();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement)!, i];\n    map.set(nums[i], i);\n  }\n  return [];\n}\n\n// Group Anagrams\nfunction groupAnagrams(strs: string[]): string[][] {\n  const map = new Map<string, string[]>();\n  for (const s of strs) {\n    const key = s.split('').sort().join('');\n    if (!map.has(key)) map.set(key, []);\n    map.get(key)!.push(s);\n  }\n  return Array.from(map.values());\n}",
            realWorldScenario: "🔐 Password Storage (Hashing): Websites never store your actual password. They store a hash (using bcrypt/SHA-256). When you login, your input is hashed and compared to the stored hash. Even if the database is breached, attackers can't reverse the hash to get passwords.\n\n🌐 CDN Routing (Consistent Hashing): When Netflix serves video, consistent hashing determines which server stores each movie. This ensures that adding/removing servers only redistributes a small fraction of content — critical at scale with 200M+ subscribers.\n\n🕵️ Plagiarism Detection (Rolling Hash): Tools like Turnitin use rolling hash (Rabin-Karp algorithm) to find matching text segments across millions of documents. The hash slides over text like a window, comparing hash values instead of characters for O(n) matching."
          }
        ]
      },
      {
        id: "recursion-backtracking",
        title: "Recursion & Backtracking",
        desc: "Divide and conquer, generate combinations",
        difficulty: "Medium",
        lessons: [
          {
            title: "Recursion Fundamentals",
            content: "Recursion is a function calling itself with a smaller input, working towards a base case. It's the natural way to solve problems with self-similar structure — trees, fractals, mathematical sequences. Every recursive solution has an iterative equivalent, but recursion is often cleaner.",
            keyPoints: [
              "Every recursion needs a base case to prevent infinite loops",
              "Recursive calls use the call stack — deep recursion can cause stack overflow",
              "Tail recursion: recursive call is the last operation — can be optimized",
              "Think in terms of: What does one level solve? What does it delegate?",
              "Draw the recursion tree to understand time complexity"
            ],
            example: "// Power function — O(log n) using divide & conquer\nfunction power(base: number, exp: number): number {\n  if (exp === 0) return 1;\n  if (exp % 2 === 0) {\n    const half = power(base, exp / 2);\n    return half * half;\n  }\n  return base * power(base, exp - 1);\n}\n\n// Tower of Hanoi\nfunction hanoi(n: number, from: string, to: string, aux: string): void {\n  if (n === 0) return;\n  hanoi(n - 1, from, aux, to);\n  console.log(`Move disk ${n} from ${from} to ${to}`);\n  hanoi(n - 1, aux, to, from);\n}",
            realWorldScenario: "🌳 DOM Traversal (Recursion): React's reconciliation algorithm (the 'diffing' process) recursively traverses the virtual DOM tree. Each component renders its children, which render their children — naturally recursive. When React detects a change, it recursively updates only the affected subtree.\n\n📂 File System Operations: Commands like 'rm -rf' and 'cp -r' are recursive — they process a directory, then recursively process all subdirectories. The 'find' command also uses recursive DFS to search through nested folders."
          },
          {
            title: "Backtracking Patterns",
            content: "Backtracking systematically explores all possible solutions by building candidates incrementally and abandoning ('backtracking') as soon as it determines a candidate cannot lead to a valid solution. It's essentially DFS with pruning.",
            keyPoints: [
              "Template: choose → explore → unchoose (backtrack)",
              "Permutations: order matters, use 'visited' array",
              "Combinations: order doesn't matter, use 'start index'",
              "Subsets: include or exclude each element",
              "Pruning: skip invalid branches early to improve performance"
            ],
            example: "// N-Queens Problem\nfunction solveNQueens(n: number): string[][] {\n  const results: string[][] = [];\n  const board = Array(n).fill('').map(() => Array(n).fill('.'));\n  const cols = new Set<number>();\n  const diag1 = new Set<number>(); // row - col\n  const diag2 = new Set<number>(); // row + col\n  \n  function backtrack(row: number) {\n    if (row === n) {\n      results.push(board.map(r => r.join('')));\n      return;\n    }\n    for (let col = 0; col < n; col++) {\n      if (cols.has(col) || diag1.has(row-col) || diag2.has(row+col)) continue;\n      board[row][col] = 'Q';\n      cols.add(col); diag1.add(row-col); diag2.add(row+col);\n      backtrack(row + 1);\n      board[row][col] = '.';\n      cols.delete(col); diag1.delete(row-col); diag2.delete(row+col);\n    }\n  }\n  backtrack(0);\n  return results;\n}\n\n// Generate All Subsets\nfunction subsets(nums: number[]): number[][] {\n  const result: number[][] = [];\n  function bt(start: number, current: number[]) {\n    result.push([...current]);\n    for (let i = start; i < nums.length; i++) {\n      current.push(nums[i]);\n      bt(i + 1, current);\n      current.pop();\n    }\n  }\n  bt(0, []);\n  return result;\n}",
            realWorldScenario: "🧩 Sudoku Solvers: Every Sudoku app's 'hint' or 'solve' button uses backtracking. Place a number, check constraints, if invalid → backtrack and try the next number. With smart pruning (constraint propagation), even hard puzzles solve in milliseconds.\n\n📅 Meeting Scheduler (Constraint Satisfaction): Scheduling a meeting across 10 people's calendars is a backtracking problem. Try a time slot, check all constraints (availability, timezone, room), if any conflict → backtrack to the next slot. Google Calendar's 'Find a time' feature uses this.\n\n🎨 Regex Engine: When a regex like 'a.*b.*c' matches against text, the regex engine uses backtracking. The '.*' greedily matches everything, then backtracks character by character until the rest of the pattern matches."
          }
        ]
      },
      {
        id: "greedy-algorithms",
        title: "Greedy Algorithms",
        desc: "Local optimal choices for global solutions",
        difficulty: "Medium",
        lessons: [
          {
            title: "Greedy Strategy & Proof Techniques",
            content: "Greedy algorithms make the locally optimal choice at each step, hoping to find the global optimum. They work when the problem has the 'greedy choice property' and 'optimal substructure'. Not all problems can be solved greedily — proving correctness is essential.",
            keyPoints: [
              "Greedy choice: a local optimum leads to a global optimum",
              "Exchange argument: prove greedy ≥ any other solution by swapping",
              "Sorting often enables greedy solutions",
              "Interval scheduling: sort by end time, greedily pick non-overlapping",
              "Huffman coding: greedily merge smallest frequency nodes"
            ],
            example: "// Activity Selection — max non-overlapping intervals\nfunction maxActivities(intervals: [number, number][]): number {\n  intervals.sort((a, b) => a[1] - b[1]); // sort by end time\n  let count = 1, end = intervals[0][1];\n  for (let i = 1; i < intervals.length; i++) {\n    if (intervals[i][0] >= end) {\n      count++;\n      end = intervals[i][1];\n    }\n  }\n  return count;\n}\n\n// Jump Game — can you reach the last index?\nfunction canJump(nums: number[]): boolean {\n  let maxReach = 0;\n  for (let i = 0; i < nums.length; i++) {\n    if (i > maxReach) return false;\n    maxReach = Math.max(maxReach, i + nums[i]);\n  }\n  return true;\n}",
            realWorldScenario: "📡 Data Compression (Huffman Coding): ZIP files, JPEG images, and MP3 audio all use Huffman coding. The greedy algorithm assigns shorter binary codes to more frequent characters. A file with lots of 'e's and 'a's compresses better because these common letters get the shortest codes.\n\n🏫 Course Scheduling: Universities solve the 'interval scheduling maximization' problem when assigning classrooms. Given lecture times, the greedy approach (sort by end time, pick non-overlapping) maximizes the number of lectures in each room.\n\n💰 Making Change: Vending machines use a greedy algorithm for giving change — always use the largest coin first. This works for standard coin denominations (25¢, 10¢, 5¢, 1¢) but fails for arbitrary denominations (where DP is needed)."
          }
        ]
      }
    ]
  },
  {
    id: "aptitude",
    category: "Aptitude Prep",
    icon: "Lightbulb",
    iconColor: "text-brand-amber",
    iconBg: "bg-amber-500/15 border-amber-500/30",
    color: "from-amber-500/20 to-yellow-600/10",
    border: "border-amber-500/30 hover:border-amber-400",
    topics: [
      {
        id: "number-systems",
        title: "Number Systems",
        desc: "HCF, LCM, divisibility rules",
        difficulty: "Easy",
        lessons: [
          {
            title: "Divisibility Rules & Prime Numbers",
            content: "Divisibility rules are shortcuts to determine if a number is divisible by another without performing division. These are incredibly useful for aptitude tests where speed matters. Prime numbers — numbers divisible only by 1 and themselves — are the building blocks of all integers.",
            keyPoints: [
              "Divisible by 2: last digit is even",
              "Divisible by 3: sum of digits is divisible by 3",
              "Divisible by 4: last two digits form a number divisible by 4",
              "Divisible by 9: sum of digits is divisible by 9",
              "Divisible by 11: alternating sum of digits is divisible by 11",
              "To check if n is prime, test divisors up to √n"
            ],
            example: "Example: Is 7,924 divisible by 4?\nCheck last two digits: 24 ÷ 4 = 6 ✓ Yes!\n\nIs 2,178 divisible by 11?\nAlternating sum: 2 - 1 + 7 - 8 = 0\n0 is divisible by 11 ✓ Yes!\n\nIs 91 prime?\n√91 ≈ 9.5 → check 2, 3, 5, 7\n91 ÷ 7 = 13 → Not prime (7 × 13 = 91)",
            realWorldScenario: "🔐 Cryptography (Prime Numbers): Every time you visit an HTTPS website, RSA encryption uses two large prime numbers multiplied together. It's easy to multiply primes but nearly impossible to factor the result — this asymmetry secures your bank transactions, passwords, and private messages.\n\n📊 Inventory Management (Divisibility): Warehouses use divisibility rules to organize shipments. If you have 1,728 items and boxes hold 12 each, quick mental math using divisibility (1+7+2+8=18, divisible by 3; last two digits 28÷4=7, divisible by 4 → divisible by 12) confirms even packaging with no leftovers."
          },
          {
            title: "HCF & LCM",
            content: "HCF (Highest Common Factor) is the largest number that divides both numbers. LCM (Least Common Multiple) is the smallest number divisible by both. The relationship HCF × LCM = Product of numbers is frequently tested. These concepts are foundational for fraction operations and scheduling problems.",
            keyPoints: [
              "HCF using Euclidean algorithm: HCF(a,b) = HCF(b, a mod b)",
              "LCM = (a × b) / HCF(a, b)",
              "HCF of fractions: HCF of numerators / LCM of denominators",
              "LCM of fractions: LCM of numerators / HCF of denominators",
              "HCF × LCM = Product of the two numbers"
            ],
            example: "Find HCF and LCM of 12 and 18:\n\n12 = 2² × 3\n18 = 2 × 3²\n\nHCF = 2¹ × 3¹ = 6 (take minimum powers)\nLCM = 2² × 3² = 36 (take maximum powers)\n\nVerify: 6 × 36 = 216 = 12 × 18 ✓\n\nEuclidean Algorithm for HCF(48, 18):\n48 = 18 × 2 + 12\n18 = 12 × 1 + 6\n12 = 6 × 2 + 0 → HCF = 6",
            realWorldScenario: "🚌 Bus Scheduling (LCM): If Bus A arrives every 12 minutes and Bus B every 18 minutes, when do they arrive together? LCM(12, 18) = 36 minutes. Transit authorities use LCM to plan synchronized schedules, transfer points, and timetables.\n\n🎁 Gift Packaging (HCF): A florist has 24 roses and 36 lilies. What's the largest number of identical bouquets with no flowers left over? HCF(24, 36) = 12 bouquets, each with 2 roses and 3 lilies."
          },
          {
            title: "Number Series & Patterns",
            content: "Number series questions test your ability to identify patterns. Common patterns include arithmetic progression (constant difference), geometric progression (constant ratio), Fibonacci-like series, and mixed patterns. The key is to look at differences between consecutive terms, then differences of differences if needed.",
            keyPoints: [
              "Arithmetic Progression: constant difference (d) between terms",
              "Geometric Progression: constant ratio (r) between terms",
              "Fibonacci pattern: each term = sum of two previous terms",
              "Look at first differences, then second differences",
              "Mixed patterns: alternating operations or two interleaved series"
            ],
            example: "Find the next term:\n\n1) 2, 6, 18, 54, ? → ×3 each time → GP with r=3 → 162\n\n2) 3, 7, 13, 21, 31, ? \n   Differences: 4, 6, 8, 10 → increasing by 2\n   Next diff: 12 → Answer: 31 + 12 = 43\n\n3) 1, 1, 2, 3, 5, 8, 13, ?\n   Fibonacci pattern → 8 + 13 = 21\n\n4) 2, 3, 5, 9, 17, ?\n   Differences: 1, 2, 4, 8 → doubling\n   Next diff: 16 → Answer: 17 + 16 = 33",
            realWorldScenario: "📈 Financial Forecasting (Series Patterns): Stock analysts use arithmetic and geometric progressions to model growth trends. If a company's revenue grew by ₹10Cr each quarter (AP), they forecast the next quarter. If it grew by 15% each quarter (GP), that's compound growth — the basis of all investment calculations.\n\n🤖 Machine Learning (Pattern Recognition): At its core, ML is pattern recognition. Training data is a 'series' — the model learns the underlying pattern (function) and predicts the next value. This is literally what you do in number series questions, but scaled to millions of dimensions."
          }
        ]
      },
      {
        id: "percentages-ratios",
        title: "Percentages & Ratios",
        desc: "Profit, loss, and proportions",
        difficulty: "Easy",
        lessons: [
          {
            title: "Percentage Calculations",
            content: "Percentages express a number as a fraction of 100. Quick mental math tricks can save significant time in aptitude tests. Understanding percentage change, successive percentages, and compound growth is key to solving most problems.",
            keyPoints: [
              "x% of y = y% of x (useful shortcut!)",
              "Percentage change = (Change / Original) × 100",
              "Successive changes: use (1 + r₁/100)(1 + r₂/100) - 1",
              "If price increases by x%, to restore: decrease by (x/(100+x))×100%",
              "Compound growth: Final = Initial × (1 + r/100)^n"
            ],
            example: "A product's price increases by 20%, then decreases by 20%.\nIs the final price the same? NO!\n\nLet original = ₹100\nAfter 20% increase: ₹120\nAfter 20% decrease: ₹120 × 0.8 = ₹96\n\nNet change = -4% (not 0%!)\nFormula: (1.2)(0.8) - 1 = 0.96 - 1 = -0.04 = -4%\n\nShortcut: For successive changes of a% and b%:\nNet change = a + b + (ab/100)\n= 20 + (-20) + (20×-20/100) = -4%",
            realWorldScenario: "🛍️ E-commerce Discounts: When Flipkart shows '50% off + extra 20% off', the total discount isn't 70%! Using the formula: (1-0.5)(1-0.2) = 0.4, so the actual discount is 60%. Retailers intentionally stack discounts this way because it sounds better than '60% off'.\n\n💰 Inflation & Salary: If inflation is 7% and your salary raise is 10%, your real purchasing power increase is NOT 3%. It's: (1.10/1.07) - 1 = 2.8%. This is why economists distinguish between 'nominal' and 'real' growth."
          },
          {
            title: "Profit, Loss & Discount",
            content: "Profit and loss calculations are based on Cost Price (CP) and Selling Price (SP). Discount is calculated on Marked Price (MP). Understanding the relationship MP → Discount → SP → Profit/Loss → CP is crucial. Shopkeepers often use deceptive practices that can be analyzed mathematically.",
            keyPoints: [
              "Profit% = (SP - CP)/CP × 100",
              "Loss% = (CP - SP)/CP × 100",
              "Discount% = (MP - SP)/MP × 100",
              "SP = CP × (1 + Profit%/100) = MP × (1 - Discount%/100)",
              "If CP of x items = SP of y items, then Profit% = (x-y)/y × 100"
            ],
            example: "A shopkeeper marks goods 40% above CP, then gives 20% discount.\nFind profit%.\n\nLet CP = ₹100\nMP = 100 × 1.4 = ₹140\nSP = 140 × 0.8 = ₹112\nProfit = ₹12 → Profit% = 12%\n\nShortcut: Net effect = 40 + (-20) + (40×-20/100)\n= 40 - 20 - 8 = 12%\n\nDishonest shopkeeper: Uses 900g weight instead of 1kg.\nProfit% = (True weight - False weight)/False weight × 100\n= (1000 - 900)/900 × 100 = 11.11%",
            realWorldScenario: "🏪 Retail Pricing Strategy: Zara marks clothes 150% above cost price, then runs '50% off' sales — they still make 25% profit! Understanding this math reveals why 'sale' items still generate profit. This is why the original 'MRP' is often inflated.\n\n📱 Subscription Pricing: When Netflix offers '₹149/month or ₹1,499/year (save 16%)', the annual plan costs 10 months' worth — saving 2 months. The '16%' discount is calculated on the monthly total (₹1,788), making it sound like a bigger deal."
          },
          {
            title: "Ratios & Proportions",
            content: "Ratios compare quantities. Direct proportion means both increase/decrease together. Inverse proportion means one increases as the other decreases. Mixture problems combine ratio concepts with averages. The alligation method is a powerful shortcut for mixture problems.",
            keyPoints: [
              "If a:b = 2:3 and b:c = 4:5, then a:b:c = 8:12:15",
              "Alligation rule: a quick way to solve mixture problems",
              "Componendo-Dividendo: if a/b = c/d, then (a+b)/(a-b) = (c+d)/(c-d)",
              "Partnership: profit shared in ratio of (capital × time)",
              "Variation: direct (y=kx), inverse (y=k/x), joint (y=kxz)"
            ],
            example: "Mix milk at ₹60/L with water (₹0/L) to get mixture at ₹45/L.\nRatio of milk to water?\n\nUsing Alligation:\n     60        0\n       \\     /\n        45\n       /     \\\n   45-0=45  60-45=15\n\nMilk : Water = 45 : 15 = 3 : 1\n\nPartnership: A invests ₹50K for 12 months, B invests ₹60K for 10 months.\nProfit ratio = 50×12 : 60×10 = 600 : 600 = 1:1",
            realWorldScenario: "🧪 Pharmaceutical Mixing (Alligation): Pharmacists use alligation daily to mix solutions. If they need a 5% saline solution but only have 3% and 8% solutions, alligation gives the exact ratio — (8-5):(5-3) = 3:2. This same math applies in chemistry labs, cocktail mixing, and paint color blending.\n\n🤝 Startup Equity Split (Partnership Ratios): When co-founders split equity, they consider capital invested × time involved. If founder A invested ₹10L for 2 years and founder B joined later with ₹20L for 1 year, the fair ratio is 10×24 : 20×12 = 240:240 = 1:1."
          }
        ]
      },
      {
        id: "time-work",
        title: "Time & Work",
        desc: "Pipes, cisterns, and efficiency",
        difficulty: "Medium",
        lessons: [
          {
            title: "Work & Efficiency",
            content: "Time and work problems use the concept that if a person can do a job in 'n' days, their one day's work is 1/n. The LCM method makes these problems much easier to solve by assuming total work as the LCM of individual completion times.",
            keyPoints: [
              "If A does work in 'a' days, A's 1 day work = 1/a",
              "LCM method: Assume total work = LCM of individual days",
              "If A is twice as efficient as B, A takes half the time",
              "Combined work rate = sum of individual work rates",
              "If A works for x days, remaining work = 1 - x/a"
            ],
            example: "A can do a job in 12 days, B in 18 days. Together?\n\nLCM(12, 18) = 36 units (total work)\nA's rate = 36/12 = 3 units/day\nB's rate = 36/18 = 2 units/day\nCombined = 5 units/day\n\nTime = 36/5 = 7.2 days\n\nVariation: A and B work together for 4 days, then A leaves.\nWork done in 4 days = 5 × 4 = 20 units\nRemaining = 36 - 20 = 16 units\nB alone: 16/2 = 8 more days\nTotal = 4 + 8 = 12 days",
            realWorldScenario: "👨‍💻 Software Project Estimation: If one developer can build a feature in 10 days and another in 15 days, the combined estimate is 6 days — NOT 5 days (the average). Project managers at companies like Google use this exact formula for sprint planning. Adding a third developer doesn't always help due to communication overhead (Brooks's Law).\n\n🏗️ Construction Planning: If Crane A fills a foundation in 6 hours and Crane B in 4 hours, running both together fills it in 2.4 hours. Construction managers calculate this to optimize equipment rental costs — renting two cranes for 2.4 hours vs one for 4 hours."
          },
          {
            title: "Pipes & Cisterns",
            content: "Pipes and cisterns problems are variants of time and work. Inlet pipes fill a tank (positive work rate), outlet pipes empty it (negative work rate). The net rate determines the fill time. These problems also appear as 'production and consumption' scenarios.",
            keyPoints: [
              "Inlet pipe: positive work rate (fills the tank)",
              "Outlet pipe: negative work rate (empties the tank)",
              "Net rate = sum of all inlet rates - sum of all outlet rates",
              "If net rate is negative, the tank will never fill",
              "Alternate opening: calculate work done in each complete cycle"
            ],
            example: "Pipe A fills a tank in 20 min, Pipe B in 30 min.\nPipe C empties it in 15 min. All open — when does it fill?\n\nLCM(20, 30, 15) = 60 units\nA's rate = +3 units/min\nB's rate = +2 units/min\nC's rate = -4 units/min\nNet rate = 3 + 2 - 4 = 1 unit/min\n\nTime to fill = 60/1 = 60 minutes\n\nWhat if C is closed after tank is half full?\nHalf tank = 30 units at rate 1 → 30 min\nRemaining 30 units at rate 5 (A+B) → 6 min\nTotal = 36 minutes",
            realWorldScenario: "🏭 Water Treatment Plants: Treatment facilities have multiple inlet pumps and outlet drains. Engineers calculate net flow rates to determine processing capacity. If incoming sewage rate exceeds treatment + drain rate, the plant overflows — a real engineering problem solved by this exact math.\n\n☁️ Cloud Server Scaling: In cloud computing, 'pipes' are like request handlers. If Server A processes 100 req/sec and traffic is 150 req/sec, one server can't handle it. Adding Server B (80 req/sec) gives total capacity of 180 req/sec — the 'overflow' analogy directly applies to auto-scaling decisions at AWS."
          },
          {
            title: "Speed, Distance & Time",
            content: "Speed = Distance/Time is the fundamental formula. Problems involve relative speed (same/opposite direction), average speed, trains and platforms, boats and streams. The key is correctly identifying which speed to use in which context.",
            keyPoints: [
              "Speed = Distance / Time (S = D/T)",
              "Same direction: Relative speed = |S₁ - S₂|",
              "Opposite direction: Relative speed = S₁ + S₂",
              "Average speed for equal distances: 2S₁S₂/(S₁ + S₂) (NOT arithmetic mean)",
              "Train crossing: Distance = length of train (+ length of platform/other train)"
            ],
            example: "A person goes to office at 30 km/h and returns at 20 km/h.\nAverage speed?\n\n❌ Wrong: (30 + 20)/2 = 25 km/h\n✓ Right: 2 × 30 × 20 / (30 + 20) = 1200/50 = 24 km/h\n\nTrain problem: A 200m train crosses a 300m platform in 25 sec.\nSpeed = Total distance / Time\n= (200 + 300) / 25 = 500/25 = 20 m/s\n= 20 × 18/5 = 72 km/h\n\nBoats: Speed upstream = (boat - stream)\nSpeed downstream = (boat + stream)",
            realWorldScenario: "✈️ Flight Time Calculations: Airlines calculate wind-adjusted flight times using relative speed. A plane flying at 800 km/h against a 100 km/h headwind has effective speed 700 km/h. The return trip with tailwind: 900 km/h. Average speed for the round trip is NOT 800 — it's 2×700×900/(700+900) = 787.5 km/h. This is why return flights are often shorter.\n\n🏎️ Formula 1 Overtaking: When Hamilton (at 320 km/h) overtakes a car going 310 km/h, the relative speed is only 10 km/h. To pass a 5m-long car, the overtake distance at relative speed takes 1.8 seconds — this is why DRS (extra 10-15 km/h) makes such a difference in F1 overtaking."
          }
        ]
      },
      {
        id: "logical-reasoning",
        title: "Logical Reasoning",
        desc: "Puzzles, seating, and arrangements",
        difficulty: "Medium",
        lessons: [
          {
            title: "Syllogisms & Logical Deductions",
            content: "Syllogisms test your ability to draw valid conclusions from given statements. Use Venn diagrams to visualize relationships. Remember: 'All A are B' doesn't mean 'All B are A'. The key is to consider ALL possible valid Venn diagram configurations.",
            keyPoints: [
              "All A are B: A is completely inside B",
              "Some A are B: A and B overlap (at least partial)",
              "No A are B: A and B don't overlap at all",
              "Draw all possible Venn diagrams to verify conclusions",
              "'Some A are not B' is true whenever A is not a subset of B"
            ],
            example: "Statements:\n1. All dogs are animals\n2. Some animals are pets\n\nConclusions:\n✓ Some dogs are animals (Always true — subset relationship)\n✗ All animals are dogs (Invalid — only A⊂B, not B⊂A)\n✗ Some dogs are pets (Possibly true, but not definite)\n✓ Some animals are not dogs (True — animals includes non-dogs)\n\nTip: If a conclusion is only SOMETIMES true,\nit's considered INVALID in syllogisms.",
            realWorldScenario: "⚖️ Legal Reasoning: Lawyers use syllogistic logic daily. 'All contracts require consideration. This agreement has no consideration. Therefore, this is not a valid contract.' Courts evaluate the validity of logical chains to make rulings. A flawed syllogism can invalidate an entire legal argument.\n\n🤖 AI Decision Systems: Chatbots and expert systems use formal logic to reason. 'IF customer is premium AND order > ₹500 THEN apply discount.' These IF-THEN rules are essentially syllogisms chained together, powering customer service automation at scale."
          },
          {
            title: "Seating Arrangements",
            content: "Seating arrangement problems require systematic tracking of positions. Create a diagram (linear or circular) and fill in information step by step, starting with the most constrained clues. These are common in banking exams and aptitude tests.",
            keyPoints: [
              "Linear: Fix one person, arrange others relative to them",
              "Circular: Fix one person to eliminate rotational symmetry",
              "Start with definite clues (exact positions), then relative ones",
              "Use elimination to narrow down possibilities",
              "Mark directions clearly: left/right for linear, clockwise for circular"
            ],
            example: "6 people (A-F) sit in a row facing north.\n• B sits next to D\n• A sits at one end\n• C is not adjacent to A or B\n• E is second from the right end\n\nStep 1: Place A at position 1 (leftmost)\nStep 2: E at position 5 (second from right)\nStep 3: BD must be adjacent → try positions 3-4\nStep 4: C can't be adjacent to A(pos1) or B → C at position 6\nStep 5: F fills remaining position 2\n\nResult: A - F - B - D - E - C",
            realWorldScenario: "✈️ Airline Seat Assignment: Airlines solve massive seating arrangement problems. Families want to sit together, some passengers need aisle seats, exit row requirements exist. The algorithm processes constraints sequentially, just like solving a seating arrangement puzzle — but for 300+ seats on a Boeing 777.\n\n🏢 Office Space Planning: When companies redesign office layouts, they solve seating arrangements with constraints: 'Marketing should be near Sales', 'Engineering needs quiet zones', 'No team should be on two different floors'. WeWork and office planning software automate this using constraint satisfaction algorithms."
          },
          {
            title: "Blood Relations & Coding-Decoding",
            content: "Blood relation problems test your ability to trace family relationships. Coding-decoding tests pattern recognition in disguised information. Both require systematic approaches: family trees for relations, and looking for letter/number shifts in codes.",
            keyPoints: [
              "Draw a family tree: males on left, females on right, '=' for married couples",
              "Generation tracking: parents above, children below, siblings at same level",
              "Common codes: letter shift (+1, -1, reverse), position-based, vowel replacement",
              "In a coded language, look for consistent patterns across examples",
              "Gender matters: brother vs sister, uncle vs aunt, nephew vs niece"
            ],
            example: "Blood Relation:\n'A is the brother of B. B is the daughter of C.\nC is the sister of D. How is D related to A?'\n\nA (male) — brother of → B (female)\nB — daughter of → C (female)\nC — sister of → D\nD is C's sibling → D is parent's child\nC is B's mother, D is C's sibling\n→ D is A's uncle or aunt (maternal)\n\nCoding: If ROSE = 6821, CHAIR = 73456\nR=6, O=8, S=2, E=1, C=7, H=3, A=4, I=5, R=6\nWhat is SEARCH? S=2, E=1, A=4, R=6, C=7, H=3\n→ SEARCH = 214673",
            realWorldScenario: "🏛️ Inheritance Law: Courts use blood relation logic to determine legal heirs. If someone dies without a will, the succession order follows strict family tree rules — spouse, children, parents, siblings, etc. Lawyers literally draw family trees and trace relationships, just like these problems.\n\n🔒 Encryption (Coding-Decoding): The Caesar cipher — shifting letters by a fixed amount — is exactly a coding-decoding problem. Julius Caesar used shift-by-3 to encrypt military messages. Modern encryption (AES, RSA) uses exponentially more complex 'codes', but the core idea of pattern-based encoding is the same."
          },
          {
            title: "Puzzles & Critical Thinking",
            content: "Puzzle-type questions test your ability to think outside the box and apply logic under pressure. These include truth-teller/liar puzzles, coin weighing problems, river crossing puzzles, and probability-based brain teasers.",
            keyPoints: [
              "Truth/Liar puzzles: Assume each person is the liar and check for contradictions",
              "Weighing puzzles: Each weighing gives 3 outcomes (left heavy, right heavy, balanced)",
              "River crossing: Track who/what is on each side at every step",
              "Process of elimination: Often faster than constructive approaches",
              "Draw tables to organize information systematically"
            ],
            example: "3 people: A always tells truth, B always lies, C alternates.\nA says: 'B is the liar'\nB says: 'I am not the liar'\nC says: 'A is the truth-teller'\n\nAnalysis:\n- If A is truth-teller: B is the liar → B says 'I am not liar' (lie ✓)\n  C alternates and says 'A is truth-teller' (true ✓)\n  This works! A=truth, B=liar, C=alternator\n\nWeighing: Find the heavier coin among 9 coins using a balance (2 weighings).\n- Split into 3 groups of 3\n- Weigh group 1 vs group 2\n  - If equal → heavy coin is in group 3\n  - If unequal → heavy coin is in heavier group\n- Take the identified group of 3, weigh 1 vs 1\n  - If equal → third coin is heavy\n  - If unequal → heavier side wins",
            realWorldScenario: "🎯 Quality Control (Weighing Puzzles): Factories use this exact logic for quality control. If a batch of 1000 products has a defective one (slightly different weight), binary-search-style weighing finds it in ~10 steps (2^10 = 1024). This saves hours compared to testing each item individually.\n\n🧠 Tech Interview Brain Teasers: Companies like Google famously asked puzzle questions: 'How many golf balls fit in a school bus?' or 'Why are manhole covers round?' The point isn't the exact answer — it's seeing your logical reasoning process, estimation skills, and ability to structure ambiguous problems."
          }
        ]
      },
      {
        id: "data-interpretation",
        title: "Data Interpretation",
        desc: "Charts, tables, and graphs",
        difficulty: "Hard",
        lessons: [
          {
            title: "Reading Charts & Quick Calculations",
            content: "Data interpretation tests your ability to extract information from visual data and perform quick calculations. Speed is crucial — learn to approximate rather than calculate exact values when options are spread apart. DI questions often come in sets of 5 questions per data set.",
            keyPoints: [
              "Bar charts: compare heights for relative values",
              "Pie charts: each 1% = 3.6°; use fractions for quick calc",
              "Line graphs: look at slopes for rate of change",
              "Tables: identify row/column relationships quickly",
              "Approximate when answer choices are far apart"
            ],
            example: "If a pie chart shows 30% for Marketing out of ₹5,00,000:\nMarketing spend = 30% × 5,00,000\n= 3 × 50,000 = ₹1,50,000\n\nTip: 30% = 3/10, so divide by 10 and multiply by 3.\nMuch faster than: 0.30 × 500000!\n\nCommon fractions to memorize:\n1/8 = 12.5%, 1/6 = 16.67%, 1/5 = 20%\n1/4 = 25%, 1/3 = 33.33%, 3/8 = 37.5%\n2/5 = 40%, 5/8 = 62.5%, 3/4 = 75%",
            realWorldScenario: "📊 Business Analytics: Every data analyst at companies like McKinsey, Deloitte, and Google reads charts daily. Quarterly business reviews (QBRs) present revenue data in bar charts, market share in pie charts, and growth trends in line graphs. Quick mental math during meetings makes you stand out.\n\n📰 Media Literacy: News outlets present data in charts that can be misleading — truncated y-axes make small changes look dramatic, 3D pie charts distort proportions. Understanding DI helps you critically evaluate news articles, political claims, and advertising statistics."
          },
          {
            title: "Advanced Data Analysis",
            content: "Complex DI questions involve multiple data sets that need to be cross-referenced. You might need to combine information from a bar chart and a table, or calculate compound growth rates from line graphs. Caselets present data in paragraph form, requiring you to extract numbers before calculating.",
            keyPoints: [
              "CAGR (Compound Annual Growth Rate): (Final/Initial)^(1/n) - 1",
              "Year-on-year growth: (Current - Previous)/Previous × 100",
              "Cross-referencing: Combine data from multiple charts/tables",
              "Caselets: Read carefully, extract numbers, then organize in a table",
              "Missing data: Calculate from given totals and partial data"
            ],
            example: "Company revenue (in Cr): 2020: ₹100, 2023: ₹133.1\n\nCAGR = (133.1/100)^(1/3) - 1\n= (1.331)^(1/3) - 1 = 1.1 - 1 = 10%\n\nVerify: 100 × 1.1 × 1.1 × 1.1 = 133.1 ✓\n\nIf profit margin was 15% in 2020 and 18% in 2023:\nProfit 2020 = ₹15 Cr, Profit 2023 = ₹23.96 Cr\nProfit CAGR = (23.96/15)^(1/3) - 1 ≈ 17%\n(Revenue grew 10%, but profit grew 17% due to margin expansion)",
            realWorldScenario: "📈 Investment Analysis: When you see '₹1 lakh invested in 2010 would be ₹10 lakhs today', that's CAGR in action. Financial advisors use CAGR to compare investments — a mutual fund with 15% CAGR vs fixed deposit at 7% CAGR over 10 years means 4x vs 2x returns.\n\n🏢 Business Consulting: McKinsey case interviews present complex data sets — 'Client revenue is flat but margins are shrinking. Here's a table of product-wise data and a chart of market share trends. Find the root cause.' This is DI combined with business logic — exactly what these questions prepare you for."
          }
        ]
      },
      {
        id: "probability-combinatorics",
        title: "Probability & Combinatorics",
        desc: "Counting, permutations, and chance",
        difficulty: "Hard",
        lessons: [
          {
            title: "Permutations & Combinations",
            content: "Permutations count arrangements where order matters. Combinations count selections where order doesn't matter. The fundamental counting principle states: if task A has m ways and task B has n ways, they can be done together in m×n ways.",
            keyPoints: [
              "Permutation: nPr = n!/(n-r)! — order matters",
              "Combination: nCr = n!/(r!(n-r)!) — order doesn't matter",
              "Circular arrangement: (n-1)! for n items in a circle",
              "With repetition: n^r (for r selections from n items, repetition allowed)",
              "Identical items: n! / (a! × b! × ...) where a,b are counts of identical items"
            ],
            example: "How many 3-letter words from APPLE?\nLetters: A, P, P, L, E (P repeats)\n\nUsing all 5 positions for 3 letters:\nCase 1: No repeated P → Choose 3 from {A,P,L,E} = 4C3 × 3! = 24\nCase 2: Both P's used + 1 other → Choose 1 from {A,L,E} = 3C1 × 3!/2! = 9\nTotal = 24 + 9 = 33\n\nCircular: 8 people around a round table = (8-1)! = 5040\nWith necklace (flipping allowed) = 5040/2 = 2520",
            realWorldScenario: "🔐 Password Strength: A 4-digit PIN has 10^4 = 10,000 combinations. An 8-character password with uppercase, lowercase, digits, and symbols (72 chars) has 72^8 ≈ 722 trillion combinations. This is why longer, diverse passwords are exponentially more secure — it's pure combinatorics.\n\n🎰 Lottery Odds: In a 6/49 lottery, the odds of winning are 1 in 49C6 = 1 in 13,983,816. That's a 0.000007% chance. Understanding combinatorics reveals why the expected return of a ₹100 lottery ticket is typically only ₹40-50 — the house always wins."
          },
          {
            title: "Probability Fundamentals",
            content: "Probability measures the likelihood of an event occurring, ranging from 0 (impossible) to 1 (certain). Understanding conditional probability, independent events, and Bayes' theorem is essential for both aptitude tests and real-world decision making.",
            keyPoints: [
              "P(A) = Favorable outcomes / Total outcomes",
              "P(A or B) = P(A) + P(B) - P(A and B)",
              "P(A and B) = P(A) × P(B) for independent events",
              "Conditional: P(A|B) = P(A and B) / P(B)",
              "Bayes' Theorem: P(A|B) = P(B|A) × P(A) / P(B)"
            ],
            example: "Two dice rolled. P(sum = 7)?\nFavorable: (1,6)(2,5)(3,4)(4,3)(5,2)(6,1) = 6\nTotal = 36\nP(sum=7) = 6/36 = 1/6\n\nBayes' Theorem:\n1% of population has a disease. Test is 99% accurate.\nIf you test positive, what's the probability you have the disease?\n\nP(Disease|Positive) = P(Pos|Disease) × P(Disease) / P(Pos)\n= 0.99 × 0.01 / (0.99×0.01 + 0.01×0.99)\n= 0.0099 / 0.0198 = 50%\n\nSurprising! Even with a 99% accurate test, if the disease\nis rare, half the positives are false positives!",
            realWorldScenario: "🏥 Medical Diagnosis (Bayes' Theorem): The example above is not hypothetical — it's why doctors don't diagnose based on a single test. COVID-19 rapid tests had ~85% accuracy, meaning in a population with 1% infection rate, most positive results were false positives. This is why confirmatory PCR tests were required.\n\n📧 Spam Filters (Naive Bayes): Gmail's spam filter uses Bayes' theorem. It calculates P(spam | contains 'free money') by looking at how often 'free money' appears in spam vs legitimate emails. Combining probabilities across all words gives a spam score. This simple technique correctly filters 99.9% of spam.\n\n🎯 A/B Testing: When a company tests two website designs, probability determines if the difference in conversion rates is 'statistically significant' or just random noise. Without understanding probability, you might redesign your entire website based on meaningless fluctuations."
          }
        ]
      }
    ]
  },
  {
    id: "hr",
    category: "HR & Soft Skills",
    icon: "PenTool",
    iconColor: "text-brand-emerald",
    iconBg: "bg-emerald-500/15 border-emerald-500/30",
    color: "from-emerald-500/20 to-green-600/10",
    border: "border-emerald-500/30 hover:border-emerald-400",
    topics: [
      {
        id: "tell-me-about-yourself",
        title: "Tell Me About Yourself",
        desc: "Craft a compelling introduction",
        difficulty: "Easy",
        lessons: [
          {
            title: "The Perfect Introduction Framework",
            content: "This is usually the first question and sets the tone for the entire interview. Use the Present-Past-Future framework: start with your current role, highlight past achievements, and connect to why you're excited about this opportunity. A strong intro builds confidence and directs the conversation towards your strengths.",
            keyPoints: [
              "Keep it 60-90 seconds — concise and impactful",
              "Present: What you currently do and your key expertise",
              "Past: Relevant experience and achievements that led you here",
              "Future: Why this role/company excites you and how you'll contribute",
              "Avoid personal details unless relevant to the role",
              "Tailor for each company — mention their specific products/mission"
            ],
            example: "\"I'm a full-stack developer with 3 years of experience specializing in React and Node.js. At my current company, I led the migration of our legacy system to a microservices architecture, which reduced deployment time by 60%. Before that, I built an internal tool that automated our QA process, saving 20 hours per week. I'm particularly excited about this role at [Company] because of your focus on developer experience tools — it aligns perfectly with my passion for building tools that make engineers more productive.\"",
            realWorldScenario: "🎯 Why This Matters: Recruiters at companies like Google, Amazon, and Microsoft hear 50+ introductions daily. They decide within the first 30 seconds if they're interested. A structured Present-Past-Future intro immediately signals that you're organized, self-aware, and have done your homework.\n\n❌ Common Mistake: 'I'm John, I did my B.Tech from XYZ University in 2020, then I joined ABC company...' — This chronological approach buries your best achievements. Interviewers don't care about your college until they're impressed by your recent work.\n\n✅ Pro Tip: Google the interviewer on LinkedIn before the call. If they work on infrastructure, emphasize your DevOps experience. If they're in product, highlight user-facing features you built. This personalization is what separates a good answer from a great one."
          },
          {
            title: "Common Variations & Tricky Versions",
            content: "Interviewers ask variations of this question to test different aspects. 'Walk me through your resume' wants chronological detail. 'Why should we hire you?' wants your value proposition. 'Tell me something not on your resume' wants personality. Each requires a different strategy.",
            keyPoints: [
              "'Walk me through your resume' → chronological, 2 min, hit each role briefly",
              "'Why should we hire you?' → match your top 3 skills to their top 3 needs",
              "'Tell me something not on your resume' → passion projects, values, unique experiences",
              "'How would your colleagues describe you?' → strengths with evidence",
              "Always end with a bridge to why you want THIS role"
            ],
            example: "Q: 'Why should we hire you?'\n\n\"Three reasons. First, I have deep expertise in your tech stack — I've built production React apps serving 500K users, which matches your scale. Second, I thrive in fast-paced environments — at my startup, I shipped features weekly and handled production incidents. Third, I'm passionate about your mission of democratizing education. I've actually built a side project in EdTech that helped 5,000 students learn programming. I'd bring both the skills and the genuine motivation to make an impact here.\"",
            realWorldScenario: "🏢 Scenario — Switching Careers: A mechanical engineer applying for a software role might say: 'My engineering background gives me a unique edge in problem-solving and systems thinking. I taught myself Python by automating my team's data analysis, reducing 4 hours of manual work to 10 minutes. This sparked my transition to software, where I've since built 3 full-stack applications...' — Framing the career switch as an asset, not a weakness.\n\n🎓 Scenario — Fresh Graduate: 'While I don't have industry experience yet, I've been proactive about building real-world skills. I led a team of 4 in building a campus food delivery app with 2,000 active users. I also contributed to 3 open-source projects, including [popular library]. My internship at [Company] gave me exposure to production codebases and agile workflows...' — Compensating for lack of experience with initiative and impact."
          }
        ]
      },
      {
        id: "star-method",
        title: "STAR Method",
        desc: "Structure behavioral answers",
        difficulty: "Easy",
        lessons: [
          {
            title: "Mastering the STAR Framework",
            content: "The STAR method provides a clear structure for answering behavioral questions. Interviewers use these to predict future behavior based on past experiences. Every behavioral answer should follow this format. Prepare 6-8 diverse STAR stories that cover common competencies.",
            keyPoints: [
              "Situation: Set the scene with context (2-3 sentences)",
              "Task: Explain your specific responsibility",
              "Action: Detail the steps YOU took (use 'I', not 'we')",
              "Result: Quantify the outcome with metrics when possible",
              "Prepare 5-6 STAR stories that cover different competencies",
              "Same story can be adapted for different questions"
            ],
            example: "Q: Tell me about a time you handled a difficult deadline.\n\nS: \"Our team had a product launch in 3 weeks, but we discovered a critical security vulnerability that could expose user data.\"\n\nT: \"As the lead developer, I needed to fix the vulnerability without delaying the launch.\"\n\nA: \"I triaged the issue overnight, broke the fix into 3 parallel workstreams, brought in a security specialist for code review, and set up daily standups to track progress. I also communicated a revised timeline to stakeholders with clear milestones.\"\n\nR: \"We patched the vulnerability in 10 days, launched on time, and the fix actually improved our auth system performance by 15%. The CEO mentioned it in the all-hands as an example of crisis management.\"",
            realWorldScenario: "📋 Story Bank Strategy: Top candidates prepare a 'story bank' — 6-8 STAR stories covering: Leadership, Conflict, Failure, Teamwork, Innovation, Deadline Pressure, and Going Above & Beyond. Each story can be tailored to different questions:\n\n• 'Tell me about a challenge' → Same story, emphasize the difficulty\n• 'Describe a leadership moment' → Same story, emphasize how you led\n• 'When did you innovate?' → Same story, emphasize the creative solution\n\nThis means preparing 6 stories covers 20+ possible questions. That's interview efficiency!"
          },
          {
            title: "Answering 'Tell Me About a Failure'",
            content: "The failure question is the most feared but most important behavioral question. Interviewers aren't looking for perfection — they want to see self-awareness, accountability, learning, and growth. Choosing the right failure story is critical: it should be genuine but not catastrophic.",
            keyPoints: [
              "Choose a real failure, not a humble brag ('I worked too hard')",
              "Take responsibility — don't blame others or circumstances",
              "Focus 70% on what you LEARNED, not the failure itself",
              "Show how you applied that learning to prevent future failures",
              "The best failures show character growth and systemic improvements",
              "Avoid: failures due to character flaws, very recent failures, or trivial mistakes"
            ],
            example: "Q: Tell me about your biggest failure.\n\n\"Early in my career, I was responsible for a database migration. I tested it thoroughly in staging but skipped the production dry run because we were behind schedule. The migration took down our service for 6 hours during peak time, affecting 50,000 users.\n\nI immediately took ownership — communicated to affected users, led the rollback, and within 12 hours published a detailed post-mortem. The root cause was that production had 10x more data than staging, causing memory issues I hadn't anticipated.\n\nThis taught me three things: never skip production dry runs, always have a rollback plan, and time pressure doesn't justify cutting safety checks. I then created a 'Migration Checklist' that the entire team adopted, and we haven't had a migration incident since. It was painful, but it made me a much more reliable engineer.\"",
            realWorldScenario: "🔍 What Interviewers Are Actually Evaluating:\n\n1. Self-awareness: Can you objectively assess your mistakes?\n2. Accountability: Do you own the failure or blame others?\n3. Learning agility: Did you extract meaningful lessons?\n4. Growth mindset: Did you create systems to prevent recurrence?\n5. Emotional maturity: Can you discuss failure without being defensive?\n\n💡 Pro Tip: Senior engineers at FAANG companies often say their failure stories are what got them hired. A genuine failure story with strong learnings is MORE impressive than a track record of 'no failures' — because the latter is either dishonest or means you never took risks."
          }
        ]
      },
      {
        id: "conflict-resolution",
        title: "Conflict Resolution",
        desc: "Handle tricky situational questions",
        difficulty: "Medium",
        lessons: [
          {
            title: "Navigating Workplace Conflicts",
            content: "Conflict resolution questions test your emotional intelligence and professionalism. The key is showing you can disagree respectfully, seek to understand the other perspective, and focus on solutions rather than blame. Frame every conflict as a collaboration challenge, not a personal battle.",
            keyPoints: [
              "Never badmouth a colleague or previous employer",
              "Show empathy: acknowledge the other person's perspective",
              "Focus on the problem, not the person",
              "Describe a constructive outcome — what you learned",
              "Demonstrate that you escalate appropriately when needed",
              "Use 'I' statements: 'I felt...' instead of 'They were wrong...'"
            ],
            example: "Q: Describe a conflict with a coworker.\n\n\"A senior developer and I disagreed on the database choice for a new feature. He preferred MongoDB for flexibility; I advocated for PostgreSQL for data integrity. Instead of pushing my preference, I suggested we both create a proof-of-concept with benchmarks relevant to our use case. The data showed PostgreSQL was 40% faster for our query patterns. He appreciated the data-driven approach, and we went with PostgreSQL. Now I always propose benchmarks when there's a technical disagreement — it removes ego from the equation.\"",
            realWorldScenario: "🤝 Real Workplace Scenarios to Prepare For:\n\n1. Technical Disagreement: You want microservices, your lead wants monolith. How do you navigate authority differences?\n\n2. Code Review Conflict: A colleague leaves harsh comments on your PR. Do you respond defensively or seek a conversation?\n\n3. Credit Attribution: A teammate presents your work as theirs in a meeting. How do you handle it without creating drama?\n\n4. Scope Creep: Product manager keeps adding features mid-sprint. How do you push back while maintaining the relationship?\n\nFor each scenario, prepare a response that shows: Empathy → Data/Reasoning → Collaborative Solution → Positive Outcome."
          },
          {
            title: "Handling Difficult Manager Questions",
            content: "Questions about managing up — dealing with a difficult boss, disagreeing with management decisions, or navigating organizational politics — require diplomatic answers. Show that you're assertive but professional, and that you understand the bigger picture.",
            keyPoints: [
              "Never directly criticize a former manager",
              "Show you understand their constraints and pressures",
              "Frame disagreements as 'different perspectives' not 'right vs wrong'",
              "Demonstrate you can influence upward through data and trust",
              "If asked about a toxic environment, focus on what YOU did, not what THEY did"
            ],
            example: "Q: Have you ever disagreed with your manager's decision?\n\n\"Yes — my manager decided to delay a security patch to prioritize a marketing feature. I understood the business pressure, but I was concerned about user data risk. Rather than escalating immediately, I quantified the risk: I calculated the potential impact of a breach (regulatory fines, user trust, estimated financial loss) and presented it alongside a proposal to parallelize both tasks with minimal delay to the marketing feature.\n\nMy manager appreciated the analysis and agreed to a modified plan: we'd ship the security patch first (2-day delay to marketing) with a clear communication to stakeholders. It strengthened our trust — she now proactively asks for my risk assessment on prioritization decisions.\"",
            realWorldScenario: "📊 Managing Up Is a Core Skill: Research by Gallup shows that 70% of employee engagement variance is determined by the manager relationship. Yet most people are never taught how to 'manage up'. The key frameworks:\n\n1. CYA (Cover Your Bases): When you disagree with a decision, document your concerns in writing. If things go wrong, you have a record. If they go right, you've shown analytical thinking.\n\n2. 15-Minute Rule: If you're stuck, try for 15 minutes, then escalate with what you've tried. This shows initiative without wasting time.\n\n3. Solution, Not Problem: Never go to your manager with just a problem. Always bring at least one proposed solution. This shifts you from 'complainer' to 'problem solver' in their perception."
          }
        ]
      },
      {
        id: "leadership-teamwork",
        title: "Leadership & Teamwork",
        desc: "Showcase collaboration skills",
        difficulty: "Medium",
        lessons: [
          {
            title: "Demonstrating Leadership Without Authority",
            content: "You don't need a 'lead' title to show leadership. Interviewers look for initiative, influence, mentorship, and the ability to rally a team around a goal. Focus on stories where you stepped up voluntarily. Leadership at its core is about making everyone around you more effective.",
            keyPoints: [
              "Leadership = influence, not authority",
              "Show how you motivated or unblocked team members",
              "Mention mentoring junior developers or new hires",
              "Describe taking ownership of problems beyond your role",
              "Highlight collaborative decision-making",
              "Show how you handled a situation where you had responsibility but no formal power"
            ],
            example: "\"When our team's sprint velocity dropped by 30%, I noticed the new developers were struggling with our codebase. Without being asked, I set up weekly 'code walkthrough' sessions where I explained our architecture decisions and common patterns. I created an onboarding wiki with setup guides, architecture diagrams, and a glossary of our domain terms.\n\nWithin a month, the new developers were contributing independently, and our velocity recovered to 110% of the original baseline. Two of the developers told me in their reviews that my sessions were the most helpful onboarding resource. My manager later asked me to formalize this as our official onboarding program.\"",
            realWorldScenario: "🌟 Types of Leadership to Demonstrate:\n\n1. Technical Leadership: 'I proposed and drove the adoption of TypeScript across 3 teams, reducing production bugs by 40%'\n\n2. Process Leadership: 'I noticed our code reviews were bottlenecking. I introduced a review rotation system and wrote a review guidelines doc that reduced review time from 3 days to 1 day'\n\n3. People Leadership: 'I mentored 2 interns. Both received full-time offers. One of them later told me my mentorship was the reason they chose this company over Google'\n\n4. Crisis Leadership: 'During a production outage at 2 AM, I coordinated the response — set up a war room, assigned investigation areas, communicated with stakeholders, and documented the incident. We resolved it in 45 minutes'\n\nPrepare one story for each type."
          },
          {
            title: "Cross-Functional Collaboration",
            content: "Modern tech companies require engineers to work closely with product managers, designers, QA, data scientists, and business stakeholders. Demonstrating cross-functional collaboration shows you can translate between technical and non-technical worlds — a highly valued skill.",
            keyPoints: [
              "Use analogies to explain technical concepts to non-technical people",
              "Show how you incorporated design/product feedback into your work",
              "Demonstrate understanding of business metrics, not just code metrics",
              "Mention trade-offs you made balancing technical and business needs",
              "Show you can say 'no' constructively with alternatives"
            ],
            example: "Q: Tell me about working with a non-technical team.\n\n\"Our product manager wanted to add real-time notifications, expecting it in 2 weeks. After a technical assessment, I realized WebSocket implementation would take 4 weeks for proper reliability. Instead of just saying 'no', I proposed a phased approach:\n\nPhase 1 (2 weeks): Email notifications + in-app polling every 30 seconds — covers 90% of use cases.\nPhase 2 (2 more weeks): Full WebSocket implementation for true real-time.\n\nI presented this with a simple diagram the PM could share with stakeholders. She loved it because Phase 1 gave her something to demo at the quarterly review. We shipped Phase 1 on time, and user engagement increased 25% — validating the approach before we invested in Phase 2.\"",
            realWorldScenario: "🏢 Real Cross-Functional Scenarios:\n\n1. Designer vs Developer: The designer wants a complex animation that would take 2 weeks. You find a CSS-only alternative that's 90% as good and takes 2 hours. How do you propose it without dismissing their vision?\n\n2. Data Scientist vs Engineer: The ML model needs a feature that requires restructuring your database. The data scientist doesn't understand the engineering cost. How do you explain the trade-off?\n\n3. Sales vs Engineering: Sales promised a client a feature in 1 month that would actually take 3 months. How do you navigate this without throwing sales under the bus?\n\nIn each case: Acknowledge their perspective → Explain constraints simply → Propose alternatives → Find a win-win."
          }
        ]
      },
      {
        id: "salary-negotiation",
        title: "Salary Negotiation",
        desc: "Navigate compensation discussions",
        difficulty: "Hard",
        lessons: [
          {
            title: "Negotiation Strategies",
            content: "Salary negotiation is a normal part of the hiring process. Companies expect candidates to negotiate. Research market rates, know your value, and negotiate the total package — not just base salary. The difference between negotiating and not can be ₹2-5 LPA or more.",
            keyPoints: [
              "Research market rates on Glassdoor, Levels.fyi, and LinkedIn",
              "Never give a number first — let the company make an offer",
              "If pressed, give a range based on market data",
              "Negotiate total compensation: base + bonus + equity + benefits",
              "Get the final offer in writing before accepting",
              "It's okay to ask for time to consider an offer"
            ],
            example: "When asked about salary expectations:\n\n✗ \"I'm looking for ₹15 LPA\" (too specific, too early)\n✓ \"I'd prefer to learn more about the role before discussing numbers. Can you share the budgeted range?\"\n\nWhen negotiating an offer:\n✓ \"Thank you for the offer of ₹12 LPA. Based on my research and the value I'll bring — specifically my experience with [relevant skill] that directly addresses [their pain point] — I was expecting something closer to ₹15-16 LPA. Is there flexibility on the base, or could we explore other components like a signing bonus or additional equity?\"",
            realWorldScenario: "💰 Real Numbers Example:\n\nCompany offers: ₹15 LPA base + ₹1.5L bonus = ₹16.5L total\nAfter negotiation: ₹17 LPA base + ₹2L bonus + ₹50K signing = ₹19.5L total\nDifference: ₹3 LPA → Over 5 years that's ₹15L+ (with raises compounding on higher base)\n\n🎯 Negotiation Script:\n1. Express enthusiasm: 'I'm really excited about this opportunity'\n2. Anchor high: 'Based on market data and my experience, I was targeting ₹X'\n3. Justify: 'Given my [specific skill] and the [specific value] I'll bring'\n4. Be flexible: 'I'm open to creative solutions — signing bonus, equity, flexible work'\n5. Set deadline: 'I'd like to make a decision by Friday — could we finalize by then?'"
          },
          {
            title: "Understanding Compensation Packages",
            content: "Total compensation goes far beyond base salary. Understanding equity (ESOPs/RSUs), bonuses, benefits, and perks allows you to negotiate smarter. Two offers with the same base salary can differ by 30-50% in total compensation.",
            keyPoints: [
              "Base salary: Fixed monthly/annual pay — most stable component",
              "Bonus: Performance-based, typically 10-20% of base at most companies",
              "ESOPs/RSUs: Company shares — can be worth ₹0 (startup) or crores (public company)",
              "Benefits: Health insurance, learning budgets, meals, gym — have real monetary value",
              "Vesting schedule: Usually 4 years with 1-year cliff for equity",
              "Consider tax implications: ESOPs are taxed differently than salary"
            ],
            example: "Comparing Two Offers:\n\nOffer A: ₹20 LPA base + ₹2L bonus = ₹22L/year\nOffer B: ₹17 LPA base + ₹1.5L bonus + RSUs worth ₹8L/year = ₹26.5L/year\n\nOffer B is worth ₹4.5L more annually!\nBut RSUs have risk — company stock could go up or down.\n\nQuestions to ask about equity:\n1. What's the current share price / last valuation?\n2. What's the vesting schedule?\n3. Are there any liquidation preferences?\n4. What happens to my equity if I leave after 2 years?\n5. How often are refresher grants given?",
            realWorldScenario: "📊 Real-World Package Comparison (India, 2024):\n\nStartup (Series B): ₹18L base + generous ESOPs (risky but potentially huge)\nMid-size (Swiggy/Meesho): ₹22L base + moderate RSUs + strong benefits\nFAANG (Google/Microsoft): ₹25L base + ₹10-15L RSUs + ₹3L bonus + premium benefits\n\nThe FAANG total comp can be ₹40-50L+ while the base looks 'only' ₹25L. Many candidates compare base-to-base and miss the full picture.\n\n🎓 For Freshers: Your first job's base salary compounds over your career. A ₹2L difference in starting salary (₹8L vs ₹10L) with average 15% YoY raises becomes a ₹6.5L difference by year 5 and a ₹20L+ difference by year 10. This is why negotiating your first offer matters more than you think."
          }
        ]
      },
      {
        id: "workplace-scenarios",
        title: "Workplace Scenarios",
        desc: "Handle hypothetical situations",
        difficulty: "Hard",
        lessons: [
          {
            title: "Ethical Dilemma Questions",
            content: "Ethical questions test your integrity, judgment, and ability to navigate gray areas. There's rarely a 'right' answer — interviewers evaluate your reasoning process, values, and whether you'd protect the company and its users.",
            keyPoints: [
              "Think out loud — show your reasoning process",
              "Consider all stakeholders: users, company, team, yourself",
              "Prioritize: User safety > Company reputation > Team dynamics > Personal comfort",
              "Mention escalation paths: when to involve your manager, legal, or compliance",
              "Show you can balance business needs with ethical responsibilities"
            ],
            example: "Q: You discover your team's product is collecting user data without proper consent. What do you do?\n\n\"First, I'd verify my understanding by reading the privacy policy and the relevant code. I'd document exactly what data is being collected and how it's used. Then I'd raise this with my manager privately, framing it as a risk: 'I noticed we're collecting X without explicit consent. Under GDPR/DPDPA, this could result in significant fines and reputation damage.'\n\nIf my manager dismisses it, I'd escalate to our legal/compliance team — most companies have anonymous reporting channels. I'd frame it constructively: 'I want to help us fix this proactively before it becomes a crisis.' Throughout, I'd document my concerns in writing.\n\nI believe engineers have a responsibility to advocate for users, especially when it comes to privacy and safety.\"",
            realWorldScenario: "🔒 Real Ethical Scenarios in Tech:\n\n1. Facebook (2018): Engineers discovered Cambridge Analytica was misusing user data. Those who raised concerns internally were initially ignored. The eventual leak cost Facebook $5 billion in FTC fines.\n\n2. Boeing 737 MAX: Engineers raised safety concerns about the MCAS system. Their concerns were deprioritized for business reasons. The result: 346 lives lost.\n\n3. Volkswagen Dieselgate: Engineers were instructed to write software that cheated emissions tests. Those who complied faced criminal charges.\n\nLesson: Raising ethical concerns isn't just morally right — it's often legally required. The short-term discomfort of speaking up is nothing compared to the long-term consequences of staying silent."
          }
        ]
      }
    ]
  },
  {
    id: "system-design",
    category: "System Design",
    icon: "BarChart3",
    iconColor: "text-brand-purple",
    iconBg: "bg-purple-500/15 border-purple-500/30",
    color: "from-purple-500/20 to-indigo-600/10",
    border: "border-purple-500/30 hover:border-purple-400",
    topics: [
      {
        id: "scalability-basics",
        title: "Scalability Basics",
        desc: "Load balancing, caching, CDNs",
        difficulty: "Medium",
        lessons: [
          {
            title: "Horizontal vs Vertical Scaling",
            content: "Scaling is about handling increased load. Vertical scaling (scale up) means adding more resources to a single machine. Horizontal scaling (scale out) means adding more machines. Modern systems prefer horizontal scaling for reliability and cost-efficiency at scale.",
            keyPoints: [
              "Vertical: Bigger machine. Simple but has physical limits (max RAM, CPU).",
              "Horizontal: More machines. Complex but virtually unlimited scaling.",
              "Load balancers distribute traffic across servers (round-robin, least connections, IP hash)",
              "Stateless services are easier to scale horizontally — no server affinity",
              "CDNs cache static content closer to users globally"
            ],
            example: "System: E-commerce website with 1M daily users\n\n1. Web tier: 4 app servers behind a load balancer (round-robin)\n2. Caching: Redis for session data + product catalog\n3. CDN: CloudFront for images, CSS, JS\n4. Database: Primary-replica setup with read replicas\n5. Result: Each server handles ~250K requests; if one fails, others absorb the load\n\nLoad Balancer Algorithms:\n• Round-robin: Requests go to servers in rotation\n• Least connections: Route to the server with fewest active requests\n• IP hash: Same client always goes to same server (session affinity)",
            realWorldScenario: "🛒 Amazon Prime Day: Amazon handles 100,000+ orders per second during Prime Day. They can't use one supercomputer — they use tens of thousands of EC2 instances across multiple regions, auto-scaling from their normal ~10,000 instances to 50,000+ during peak. Each service scales independently: the payment service might need 5x more instances while the product page service needs 10x more.\n\n🎮 Fortnite Matchmaking: Epic Games serves 80M+ monthly players. Their matchmaking service scales horizontally — spinning up new game server instances within seconds when player count spikes. During events like Travis Scott's virtual concert (12.3M simultaneous players), they scaled to 10x normal capacity within minutes."
          },
          {
            title: "Caching Strategies",
            content: "Caching stores frequently accessed data in fast storage to reduce database load and latency. Understanding cache invalidation strategies is crucial — Phil Karlton said: 'There are only two hard things in Computer Science: cache invalidation and naming things.'",
            keyPoints: [
              "Cache-aside (Lazy): App checks cache, falls back to DB on miss",
              "Write-through: Write to cache and DB simultaneously",
              "Write-behind: Write to cache, async write to DB (risk: data loss on crash)",
              "TTL (Time-To-Live): Auto-expire cached data after set duration",
              "Cache invalidation: When underlying data changes, update/remove cache",
              "Cache stampede: Multiple threads try to rebuild cache simultaneously"
            ],
            example: "Cache-Aside Pattern:\n\n1. Request: GET /user/123\n2. Check Redis: cache MISS\n3. Query PostgreSQL: SELECT * FROM users WHERE id=123\n4. Store in Redis: SET user:123 {data} EX 3600\n5. Return response\n\nNext request for same user → cache HIT → ~1ms vs ~50ms\n\nCache Hierarchy (speed → capacity tradeoff):\nL1 Cache: ~1ns, 64KB (CPU internal)\nL2 Cache: ~4ns, 256KB\nL3 Cache: ~12ns, 8MB\nRAM: ~100ns, 16-64GB\nRedis: ~1ms, cluster across servers\nSSD: ~100μs, TBs\nHDD: ~10ms, TBs",
            realWorldScenario: "🐦 Twitter's Cache Architecture: Twitter caches tweets in Redis — when you scroll your feed, most tweets are served from cache, not the database. Their cache cluster stores 300TB+ of data across thousands of Redis instances. When a celebrity posts, millions of requests for the same tweet are served from cache, preventing the database from melting.\n\n📺 Netflix Caching: Netflix caches movie metadata, thumbnails, and user preferences in EVCache (their custom caching layer built on Memcached). A single Netflix page load triggers 100+ microservice calls — without caching, each page would take 30+ seconds instead of under 1 second."
          },
          {
            title: "Content Delivery Networks (CDNs)",
            content: "CDNs distribute static content (images, CSS, JS, videos) across servers worldwide, serving content from the location nearest to the user. This dramatically reduces latency and bandwidth costs. Understanding CDN architecture is essential for any system serving global users.",
            keyPoints: [
              "Edge servers: CDN nodes closest to end users",
              "Origin server: The original source of content",
              "Cache-Control headers: Determine how long CDN caches content",
              "Purge/Invalidation: Force CDN to fetch fresh content",
              "SSL termination: CDN handles HTTPS, reducing origin server load",
              "DDoS protection: CDNs absorb attack traffic across their global network"
            ],
            example: "CDN Request Flow:\n\n1. User in Mumbai requests image.jpg\n2. DNS resolves to nearest CDN edge (Mumbai POP)\n3. Edge server checks local cache\n   → HIT: Return image (5ms latency)\n   → MISS: Fetch from origin (Singapore, 200ms)\n4. Edge caches for future Mumbai requests\n\nWithout CDN: Every request → origin server (200ms)\nWith CDN: First request 200ms, subsequent 5ms\n\nCache-Control headers:\nCache-Control: public, max-age=86400  → Cache for 1 day\nCache-Control: no-cache               → Always revalidate\nCache-Control: immutable               → Never changes (versioned URLs)",
            realWorldScenario: "🎬 YouTube Video Delivery: YouTube has CDN edge servers in 90+ countries. When a video goes viral, it's automatically replicated to edge servers worldwide. A user in Brazil watches the same video as someone in Japan, but each is served from their local edge — reducing latency from 500ms to 20ms and saving Google massive bandwidth costs.\n\n🛡️ DDoS Mitigation: During the 2023 record-breaking DDoS attack (71M requests/second), Cloudflare's CDN absorbed the traffic across their 300+ data centers globally. No single server saw more than a fraction of the traffic. Without a CDN, the target server would have crashed in seconds."
          }
        ]
      },
      {
        id: "database-design",
        title: "Database Design",
        desc: "SQL vs NoSQL, indexing, sharding",
        difficulty: "Medium",
        lessons: [
          {
            title: "Choosing the Right Database",
            content: "The database choice depends on your data model, consistency requirements, and scale. SQL databases are great for structured data with complex queries. NoSQL databases excel at flexible schemas and horizontal scaling. In practice, large systems use multiple databases — each optimized for its specific use case.",
            keyPoints: [
              "SQL (PostgreSQL, MySQL): ACID, complex joins, structured data",
              "Document DB (MongoDB): Flexible schema, nested data, JSON-like",
              "Key-Value (Redis): Ultra-fast reads, session/cache storage",
              "Wide-Column (Cassandra): High write throughput, time-series",
              "Graph DB (Neo4j): Relationship-heavy data, social networks"
            ],
            example: "Choosing a DB for a social media app:\n\n• User profiles → PostgreSQL (structured, relational)\n• News feed → Cassandra (high write throughput, time-ordered)\n• Sessions → Redis (fast read/write, auto-expiry)\n• Friend connections → Neo4j (graph traversals)\n• Media metadata → MongoDB (flexible schema)\n\nDecision Framework:\n1. Data structure? Structured → SQL. Flexible → NoSQL\n2. Read vs Write heavy? Read → caching + replicas. Write → Cassandra\n3. Consistency need? Banking → strong (SQL). Social feed → eventual (NoSQL)\n4. Query complexity? Joins needed → SQL. Simple lookups → Key-Value\n5. Scale? Millions of rows → either. Billions → NoSQL + sharding",
            realWorldScenario: "🏦 Banking Systems: Banks like HDFC use Oracle/PostgreSQL for transactions because they need ACID guarantees — if ₹1000 is debited from your account, it MUST be credited to the recipient. Eventual consistency (NoSQL) is unacceptable when money is involved.\n\n📱 Instagram's Polyglot Persistence: Instagram uses PostgreSQL for user data, Cassandra for the feed (billions of writes daily), Redis for caching and rate limiting, and Elasticsearch for the search/explore feature. Each database is chosen for its strength — no single database can do everything well at Instagram's scale (2B+ users)."
          },
          {
            title: "Database Indexing & Query Optimization",
            content: "Indexes dramatically speed up database reads at the cost of slower writes and extra storage. Understanding when and how to create indexes is crucial for system performance. A missing index can turn a 10ms query into a 10-second query.",
            keyPoints: [
              "B-Tree index: Default. Good for range queries and equality (WHERE age > 25)",
              "Hash index: O(1) exact lookups (WHERE email = 'x@y.com')",
              "Composite index: Multi-column (user_id, created_at) — order matters!",
              "Covering index: Includes all needed columns — avoids table lookup",
              "EXPLAIN/ANALYZE: Always check query plans before and after indexing",
              "Too many indexes: Slows writes and uses disk space"
            ],
            example: "Without index: SELECT * FROM orders WHERE user_id = 123\n→ Full table scan of 10M rows → 5 seconds\n\nWith index: CREATE INDEX idx_orders_user ON orders(user_id)\n→ B-Tree lookup → 5 milliseconds (1000x faster!)\n\nComposite index order matters:\nCREATE INDEX idx ON orders(user_id, created_at)\n\n✓ WHERE user_id = 123                    → Uses index\n✓ WHERE user_id = 123 AND created_at > X → Uses index\n✗ WHERE created_at > X                   → Cannot use index!\n\nRule: Leftmost prefix — the index is used left-to-right.\n\nEXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 123;\n→ Shows: 'Index Scan' (good) vs 'Seq Scan' (bad)",
            realWorldScenario: "⚡ Real Performance Impact:\n\nA startup had a 'users' table with 5M rows. Their login query (SELECT * FROM users WHERE email = ?) took 3 seconds — causing timeout errors during peak hours. Adding a single index on the email column reduced it to 2ms. Total effort: 1 line of SQL.\n\n📊 Slack's Index Strategy: Slack stores billions of messages. They use composite indexes like (channel_id, timestamp) to efficiently load message history. Without this index, loading a channel's messages would scan the entire messages table — impossible at their scale of 65M+ daily active users.\n\n⚠️ Over-Indexing: One team added 15 indexes on a frequently-written table. Their INSERT operations slowed from 5ms to 150ms because each write had to update 15 indexes. The fix: Remove 10 rarely-used indexes, reducing write latency to 20ms while keeping read performance acceptable."
          },
          {
            title: "Database Sharding & Partitioning",
            content: "When a single database can't handle the load, you split data across multiple databases. Horizontal partitioning (sharding) distributes rows across servers. Vertical partitioning splits columns. The sharding key determines how data is distributed and is the most critical design decision.",
            keyPoints: [
              "Sharding: Split rows across multiple database servers",
              "Partition key: Determines which shard holds each row",
              "Hash-based: hash(key) % N → even distribution but hard rebalancing",
              "Range-based: user IDs 1-1M on shard 1, 1M-2M on shard 2",
              "Consistent hashing: Minimizes data movement when adding/removing shards",
              "Cross-shard queries: Expensive — design to avoid them"
            ],
            example: "Sharding an orders table by user_id:\n\nShard 1: user_id % 4 == 0 (Users 0, 4, 8, ...)\nShard 2: user_id % 4 == 1 (Users 1, 5, 9, ...)\nShard 3: user_id % 4 == 2 (Users 2, 6, 10, ...)\nShard 4: user_id % 4 == 3 (Users 3, 7, 11, ...)\n\n✓ GET orders for user 123 → Shard (123%4=3) → Single shard query\n✗ GET total orders today → Query ALL 4 shards → Scatter-gather\n\nWhy user_id is a good shard key:\n• Most queries are per-user (single shard)\n• Even distribution across shards\n• Users don't move between shards\n\nBad shard key: country (uneven — India shard 10x larger than others)",
            realWorldScenario: "💳 Stripe's Sharding: Stripe processes billions in payments. They shard by merchant_id — each merchant's transactions live on one shard. This means checking a merchant's balance is a single-shard query (fast), while cross-merchant analytics requires scatter-gather across all shards (acceptable, since it's a background job).\n\n💬 Discord's Message Sharding: Discord shards messages by channel_id. Each channel's messages are on one shard, so loading a channel's history is fast. But searching across all channels requires querying multiple shards — which is why Discord's search is noticeably slower than loading messages.\n\n⚠️ Sharding Horror Story: A company sharded by date (January data on shard 1, February on shard 2, etc.). The latest month's shard was always hot (handling all current traffic) while older shards sat idle. They had to re-shard by user_id — a painful multi-month migration involving dual-writes and data reconciliation."
          }
        ]
      },
      {
        id: "api-design",
        title: "API Design",
        desc: "REST, GraphQL, rate limiting",
        difficulty: "Medium",
        lessons: [
          {
            title: "RESTful API Best Practices",
            content: "REST APIs use HTTP methods and URLs to represent resources. Good API design is intuitive, consistent, and handles errors gracefully. Pagination, versioning, and rate limiting are essential for production APIs. A well-designed API is the most important interface in modern software.",
            keyPoints: [
              "Use nouns for resources: /users, /posts (not /getUsers)",
              "HTTP methods: GET (read), POST (create), PUT (update), DELETE",
              "Use proper status codes: 200, 201, 400, 401, 404, 500",
              "Paginate list endpoints: ?page=1&limit=20 or cursor-based",
              "Version your API: /api/v1/users",
              "HATEOAS: Include links to related resources in responses"
            ],
            example: "Well-designed REST API:\n\nGET    /api/v1/users           → List users (paginated)\nGET    /api/v1/users/123       → Get user 123\nPOST   /api/v1/users           → Create user\nPUT    /api/v1/users/123       → Update user 123\nPATCH  /api/v1/users/123       → Partial update user 123\nDELETE /api/v1/users/123       → Delete user 123\nGET    /api/v1/users/123/posts → User 123's posts\n\nPagination response:\n{\n  \"data\": [...],\n  \"meta\": { \"total\": 1000, \"page\": 1, \"limit\": 20 },\n  \"links\": { \"next\": \"/api/v1/users?page=2&limit=20\" }\n}\n\nError response:\n{\n  \"error\": {\n    \"code\": \"VALIDATION_ERROR\",\n    \"message\": \"Email is required\",\n    \"details\": [{ \"field\": \"email\", \"message\": \"must be a valid email\" }]\n  }\n}",
            realWorldScenario: "🔌 Stripe's API — The Gold Standard: Stripe is universally praised for having the best API design in the industry. Key lessons:\n\n1. Consistent naming: All resources are plural nouns (/charges, /customers)\n2. Idempotency keys: Retry-safe POST requests — if network fails, resend safely\n3. Expandable responses: GET /charges/ch_123?expand[]=customer — fetch related data in one call\n4. Detailed errors: Error codes, human messages, and documentation links\n5. Versioning: Pin API version per account, not per endpoint\n\nTheir API-first approach is why Stripe is worth $50B+ — developers LOVE using it, leading to organic growth."
          },
          {
            title: "GraphQL vs REST & Rate Limiting",
            content: "GraphQL lets clients request exactly the data they need, solving REST's over-fetching and under-fetching problems. Rate limiting protects APIs from abuse and ensures fair usage. Both are critical topics in system design interviews.",
            keyPoints: [
              "GraphQL: Single endpoint, client specifies exactly what data it needs",
              "Over-fetching (REST): GET /users returns ALL fields even if you need just the name",
              "Under-fetching (REST): Need 3 API calls to get user + posts + comments",
              "Rate limiting algorithms: Token bucket, sliding window, fixed window",
              "Rate limit headers: X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After",
              "API Gateway: Centralized rate limiting, auth, logging (Kong, AWS API Gateway)"
            ],
            example: "REST vs GraphQL comparison:\n\n// REST: 3 requests needed\nGET /users/123           → {id, name, email, bio, avatar, ...}\nGET /users/123/posts     → [{id, title, content, ...}, ...]\nGET /posts/456/comments  → [{id, text, author, ...}, ...]\n\n// GraphQL: 1 request, exact data\nquery {\n  user(id: 123) {\n    name\n    posts(limit: 5) {\n      title\n      comments(limit: 3) { text, author { name } }\n    }\n  }\n}\n\nRate Limiting (Token Bucket):\n- Bucket holds 100 tokens, refills 10/second\n- Each request costs 1 token\n- Burst: 100 requests instantly, then 10/sec steady\n- Bucket empty → 429 Too Many Requests",
            realWorldScenario: "📱 GitHub's GraphQL API: GitHub switched from REST (v3) to GraphQL (v4) because mobile apps were making 10+ API calls per screen. With GraphQL, the GitHub mobile app loads your dashboard in 1 request instead of 8 — reducing latency by 60% and data transfer by 70%.\n\n🛡️ Twitter's Rate Limiting Drama: In 2023, Twitter (X) aggressively rate-limited API access — free users could read only 600 tweets/day. This was partly to combat AI scraping. The technical implementation: a sliding window rate limiter tracked reads per user per 15-minute window, with different tiers for free/premium/enterprise.\n\n🎯 DDoS via API Abuse: Without rate limiting, a single attacker could send millions of requests to an expensive endpoint (like /search), overloading the database. API gateways like Cloudflare apply rate limits at the edge, blocking abusive traffic before it reaches your servers."
          }
        ]
      },
      {
        id: "microservices",
        title: "Microservices",
        desc: "Service decomposition patterns",
        difficulty: "Hard",
        lessons: [
          {
            title: "Microservices Architecture",
            content: "Microservices decompose a monolith into independent, deployable services. Each service owns its data and communicates via APIs or message queues. This enables independent scaling and deployment but adds significant operational complexity.",
            keyPoints: [
              "Single Responsibility: Each service does one thing well",
              "Database per service: No shared databases — data isolation",
              "Communication: Sync (REST/gRPC) or Async (message queues)",
              "Service discovery: How services find each other (Consul, Kubernetes DNS)",
              "Circuit breaker pattern: Prevent cascade failures"
            ],
            example: "E-commerce Microservices:\n\n┌─────────┐   ┌──────────┐   ┌─────────────┐\n│  User   │   │  Product │   │   Order     │\n│ Service │   │ Service  │   │  Service    │\n└────┬────┘   └────┬─────┘   └──────┬──────┘\n     │             │                │\n     └─────────────┼────────────────┘\n                   │\n           ┌───────┴───────┐\n           │ Message Queue │\n           │  (RabbitMQ)   │\n           └───────────────┘\n\nOrder placed → Event published → Inventory updated → Email sent\n\nCircuit Breaker States:\nCLOSED → requests flow normally\nOPEN → all requests fail fast (service is down)\nHALF-OPEN → allow few test requests to check recovery",
            realWorldScenario: "🛒 Amazon's Microservices Journey: Amazon pioneered microservices in 2002. Their CEO Jeff Bezos sent a now-famous memo: 'All teams must communicate through service interfaces. No direct database access. No exceptions.' This forced 200+ teams to build independent services. Today, a single Amazon page load triggers calls to 100-150 microservices.\n\n💀 Microservices Failure at Segments: A startup called Segments.ai migrated from monolith to microservices with only 5 engineers. The operational overhead (managing 20+ services, Kubernetes, service mesh) consumed 60% of their engineering time. They migrated BACK to a monolith and were able to ship 3x faster. Lesson: Microservices aren't always the answer — team size and operational maturity matter."
          },
          {
            title: "Event-Driven Architecture & CQRS",
            content: "Event-driven architecture decouples services through events. CQRS (Command Query Responsibility Segregation) separates read and write models for optimal performance. Saga pattern manages distributed transactions across microservices.",
            keyPoints: [
              "Event sourcing: Store events, not current state — complete audit trail",
              "CQRS: Separate read model (optimized for queries) from write model",
              "Saga pattern: Manage distributed transactions with compensating actions",
              "Choreography: Services react to events independently (decentralized)",
              "Orchestration: A central coordinator manages the workflow",
              "Idempotency: Process the same event multiple times without side effects"
            ],
            example: "Order Saga (Choreography):\n\n1. Order Service → publishes 'OrderCreated'\n2. Payment Service → receives event → processes payment\n   → publishes 'PaymentCompleted' or 'PaymentFailed'\n3. Inventory Service → receives 'PaymentCompleted'\n   → reserves items → publishes 'InventoryReserved'\n4. Shipping Service → receives 'InventoryReserved'\n   → creates shipment → publishes 'ShipmentCreated'\n\nIf Payment fails:\n→ OrderService receives 'PaymentFailed'\n→ Order status set to 'Cancelled'\n→ No inventory or shipping actions needed\n\nIf Inventory fails after payment:\n→ PaymentService receives 'InventoryFailed'\n→ Refund is issued (compensating action)\n→ OrderService cancels order",
            realWorldScenario: "🏦 Banking Event Sourcing: Banks don't store 'balance = ₹50,000'. They store every transaction event: +₹1,00,000 (salary), -₹30,000 (rent), -₹20,000 (groceries). The current balance is computed from events. This gives a complete audit trail — essential for regulations. If there's a dispute, they can replay events to find exactly what happened.\n\n📦 Uber's Saga Pattern: When you book an Uber, a saga coordinates: 1) Find driver → 2) Confirm driver → 3) Reserve payment → 4) Start trip. If the driver cancels at step 2, the saga rolls back: releases the driver match and removes the payment hold. Each step has a compensating action, ensuring consistency across distributed services."
          }
        ]
      },
      {
        id: "realtime-systems",
        title: "Real-time Systems",
        desc: "WebSockets, pub/sub, event-driven",
        difficulty: "Hard",
        lessons: [
          {
            title: "Building Real-time Features",
            content: "Real-time systems deliver data to users instantly. WebSockets provide full-duplex communication. Pub/Sub patterns decouple publishers from subscribers. Understanding the trade-offs between different real-time technologies is essential for designing chat systems, live feeds, and collaborative tools.",
            keyPoints: [
              "WebSockets: Persistent connection, bidirectional, low latency",
              "Server-Sent Events (SSE): Server → Client only, simpler, auto-reconnect",
              "Pub/Sub: Decouple message producers from consumers",
              "Event sourcing: Store events, not state — enables replay and audit",
              "Long polling: Fallback when WebSockets aren't available",
              "Heartbeats: Detect dead connections (ping/pong every 30s)"
            ],
            example: "Chat Application Architecture:\n\n1. Client connects via WebSocket to Chat Service\n2. Message sent → stored in DB + published to Redis Pub/Sub\n3. All connected chat servers receive the message\n4. Each server pushes to relevant connected clients\n5. Offline users: Store in 'unread' queue, deliver on reconnect\n\nScale: 1 server handles ~50K concurrent WebSocket connections\n→ 20 servers = 1M concurrent users\n\nConnection lifecycle:\n1. HTTP Upgrade request → WebSocket handshake\n2. Bidirectional message stream\n3. Heartbeat: ping every 30s, timeout after 90s no pong\n4. Reconnect: Client auto-reconnects with exponential backoff",
            realWorldScenario: "💬 WhatsApp's Architecture: WhatsApp handles 100B+ messages daily with remarkable efficiency. Their architecture:\n- Each server handles 2M+ connections using Erlang (optimized for concurrent connections)\n- Messages are stored temporarily until delivered, then deleted\n- End-to-end encryption means servers never read message content\n- Presence system (online/typing/last seen) uses separate lightweight channels\n\n📊 Real-time Stock Trading: Platforms like Zerodha use WebSockets to push live stock prices. During market hours, they push 1M+ price updates per second. Each client subscribes to specific stocks — the server maintains a subscription registry to route updates efficiently. Even a 100ms delay can mean significant money in high-frequency trading.\n\n🎮 Multiplayer Gaming: Fortnite servers handle 100 players per match with 20-30 updates per second (position, health, inventory). That's 3,000 state updates/second per match, across millions of concurrent matches. They use UDP (faster than TCP) with custom reliability layers for critical events (eliminations, item pickups)."
          },
          {
            title: "Designing a Notification System",
            content: "A notification system is a classic system design interview question. It involves multiple delivery channels (push, email, SMS, in-app), prioritization, rate limiting, and user preferences. The system must be reliable, scalable, and not annoying to users.",
            keyPoints: [
              "Multi-channel: push notifications, email, SMS, in-app, webhooks",
              "Priority levels: Critical (security alerts) > High (messages) > Low (promotions)",
              "Rate limiting: Don't spam users — aggregate similar notifications",
              "User preferences: Respect mute schedules and channel preferences",
              "Delivery guarantee: At-least-once with deduplication",
              "Analytics: Track delivery rate, open rate, click-through rate"
            ],
            example: "Notification System Architecture:\n\nProducers → Kafka Topic → Notification Service\n                              ↓\n              ┌────────────────┼────────────────┐\n              ↓                ↓                ↓\n         Push (FCM/APNs)  Email (SES)    SMS (Twilio)\n              ↓                ↓                ↓\n         Rate Limiter     Rate Limiter    Rate Limiter\n              ↓                ↓                ↓\n           Device           Inbox          Phone\n\nDeduplication:\n- Generate hash of (user_id + notification_type + content)\n- Check Redis: if hash exists → skip (already sent)\n- If not → send + store hash with 24h TTL\n\nBatching:\n- 10 likes on your post in 5 min\n- Don't send 10 notifications\n- Batch: 'John and 9 others liked your post'",
            realWorldScenario: "📱 Instagram Notification Optimization: Instagram sends billions of push notifications daily. They discovered that sending too many notifications caused users to disable them entirely. Their solution:\n\n1. ML model predicts notification value per user\n2. Daily budget per user (max 5 push notifications)\n3. Highest-value notifications are sent, rest go to in-app only\n4. 'Quiet hours' respected based on timezone\n5. Result: 20% increase in notification open rates and 15% fewer opt-outs\n\n🔔 Slack's Notification System: Slack's notification logic is surprisingly complex:\n- Desktop active → no push to mobile (suppress)\n- Keyword mentions → always high priority\n- Muted channels → only @mentions\n- DND schedule → hold notifications, deliver in batch at end\n- Thread replies → notify only if you're in the thread\n\nThis requires real-time state tracking (which devices are active) combined with user preference lookups — all in under 100ms per notification decision."
          }
        ]
      },
      {
        id: "system-design-interviews",
        title: "System Design Interview Framework",
        desc: "Structured approach to design problems",
        difficulty: "Hard",
        lessons: [
          {
            title: "The 4-Step Framework",
            content: "System design interviews test your ability to design large-scale systems. Follow a structured approach: Requirements → Estimation → High-Level Design → Deep Dive. Time management is crucial — spend 5 min on requirements, 5 on estimation, 15 on design, and 15 on deep dives.",
            keyPoints: [
              "Step 1: Clarify requirements — functional AND non-functional",
              "Step 2: Estimate scale — DAU, QPS, storage, bandwidth",
              "Step 3: High-level design — major components and data flow",
              "Step 4: Deep dive — optimize bottlenecks, discuss trade-offs",
              "Always discuss trade-offs — there's no perfect solution",
              "Draw diagrams as you talk — visual communication is key"
            ],
            example: "Design Twitter — Requirements Phase:\n\nFunctional:\n• Post tweets (280 chars + media)\n• Follow users\n• News feed (timeline)\n• Search tweets\n• Like/retweet\n\nNon-Functional:\n• 500M DAU, 200M tweets/day\n• Feed loads in < 200ms\n• 99.99% availability\n• Eventually consistent (feed delay OK)\n\nEstimation:\n• Write QPS: 200M / 86400 ≈ 2,300 tweets/sec\n• Read QPS: 500M users × 10 feed loads = 5B/day ≈ 58K reads/sec\n• Storage: 200M tweets × 300 bytes = 60GB/day\n• Read-heavy: 25:1 read/write ratio → optimize for reads!",
            realWorldScenario: "🎯 What Gets You Hired vs Rejected:\n\n❌ Rejected Candidate: Jumps straight to drawing boxes. Doesn't ask requirements. Designs for the wrong scale. Can't explain trade-offs.\n\n✅ Hired Candidate: 'Before I start, let me clarify the requirements...' Asks about scale, prioritizes features, estimates QPS, then designs incrementally. When asked 'what if traffic 10x?', they know exactly which components need to change.\n\n📋 Preparation Checklist — Practice These 10 Systems:\n1. URL Shortener (beginner)\n2. Rate Limiter\n3. Chat System (WhatsApp)\n4. News Feed (Twitter/Instagram)\n5. Search Autocomplete\n6. Video Streaming (YouTube)\n7. Ride Sharing (Uber)\n8. Distributed Cache\n9. Notification System\n10. Payment System\n\nEach covers different concepts. Master all 10, and you can handle any variant."
          },
          {
            title: "Design a URL Shortener (Complete Example)",
            content: "Designing a URL shortener (like bit.ly) is the classic starter system design question. It covers hashing, databases, caching, and scale estimation. Let's walk through the complete design process.",
            keyPoints: [
              "Core: Map short URL → long URL and redirect",
              "Short code generation: Base62 encoding of auto-increment ID or hash",
              "Read-heavy: 100:1 read/write ratio — caching is critical",
              "301 vs 302 redirect: 301 (permanent) for SEO, 302 (temporary) for analytics",
              "Analytics: Track clicks, referrers, geography, devices",
              "Expiration: TTL-based cleanup of expired URLs"
            ],
            example: "High-Level Design:\n\nWrite: POST /shorten {longUrl}\n1. Generate unique short code (Base62 of counter)\n2. Store in DB: {shortCode, longUrl, userId, createdAt, expiresAt}\n3. Return: https://short.ly/abc123\n\nRead: GET /abc123\n1. Check Redis cache → HIT → redirect\n2. Cache MISS → query DB → cache result → redirect\n\nBase62 encoding:\ncharset = [a-z, A-Z, 0-9] = 62 chars\n6 chars → 62^6 = 56.8 billion unique URLs\n7 chars → 62^7 = 3.5 trillion unique URLs\n\nID → Base62:\n12345 → 12345 / 62 = 199 r 7 → '7'\n199 / 62 = 3 r 11 → 'b'\n3 / 62 = 0 r 3 → 'd'\nResult: 'db7'\n\nScale: 100M URLs/day × 500 bytes = 50GB/day\nRead QPS: 10B reads/day ÷ 86400 = 115K reads/sec\n→ Redis can handle 100K+ ops/sec on single instance",
            realWorldScenario: "📊 Bit.ly by the Numbers: Bit.ly processes 10B+ clicks per month across 600M+ short links. Their architecture:\n\n1. Nginx handles SSL termination and routes to app servers\n2. App servers check Memcached (cache hit rate: 99.5%)\n3. Cache miss → query Cassandra (distributed, replicated)\n4. Analytics pipeline: Every click → Kafka → real-time dashboard\n5. Short code generation: Distributed counter using ZooKeeper ranges\n\nLessons from Bit.ly:\n• 99.5% cache hit rate means only 0.5% of requests touch the DB\n• They use 302 (temporary) redirects to track analytics — 301 would be cached by browsers\n• Custom short domains (yourbrand.co/xyz) are their premium feature — same system, different domain mapping\n\nThis is a real $500M+ business built on what seems like a simple redirect service. The value is in analytics, link management, and enterprise features built on top."
          }
        ]
      }
    ]
  }
];
