import type { QuizQuestion } from "./preparationCourses";

// Quiz data keyed by: categoryId -> topicId -> lessonIndex
type QuizMap = Record<string, Record<string, Record<number, QuizQuestion[]>>>;

export const quizData: QuizMap = {
  coding: {
    "arrays-strings": {
      // Already inline for lessons 0-3
    },
    "linked-lists-stacks": {
      0: [
        { question: "What is the time complexity of inserting at the head of a singly linked list?", options: ["O(n)", "O(log n)", "O(1)", "O(n²)"], correctAnswer: 2, explanation: "Inserting at the head only requires creating a new node and pointing it to the current head — O(1)." },
        { question: "What does Floyd's cycle detection algorithm use?", options: ["Two stacks", "A hash set", "Two pointers moving at different speeds", "Recursion"], correctAnswer: 2, explanation: "Floyd's algorithm uses a slow pointer (1 step) and a fast pointer (2 steps). If they meet, a cycle exists." },
        { question: "Which data structure is best for implementing an LRU cache?", options: ["Array + Stack", "Doubly linked list + Hash map", "Binary tree + Queue", "Single linked list"], correctAnswer: 1, explanation: "A doubly linked list allows O(1) removal/insertion, and a hash map provides O(1) lookup — together they enable O(1) LRU operations." }
      ],
      1: [
        { question: "What principle does a stack follow?", options: ["FIFO", "LIFO", "Priority-based", "Random access"], correctAnswer: 1, explanation: "Stacks follow Last In, First Out (LIFO) — the most recently pushed element is popped first." },
        { question: "Which problem is best solved using a monotonic stack?", options: ["Finding duplicates", "Next greater element", "Sorting an array", "Binary search"], correctAnswer: 1, explanation: "Monotonic stacks efficiently solve 'next greater/smaller element' problems in O(n) by maintaining a decreasing/increasing sequence." },
        { question: "What is the primary use of a stack in compilers?", options: ["Memory allocation", "Matching parentheses and braces", "Garbage collection", "Code optimization"], correctAnswer: 1, explanation: "Compilers use stacks to match opening and closing brackets/braces — an unmatched bracket means a syntax error." }
      ],
      2: [
        { question: "What principle does a queue follow?", options: ["LIFO", "FIFO", "FILO", "Random"], correctAnswer: 1, explanation: "Queues follow First In, First Out (FIFO) — the first element enqueued is the first dequeued." },
        { question: "What data structure is used for BFS traversal?", options: ["Stack", "Queue", "Heap", "Hash map"], correctAnswer: 1, explanation: "BFS uses a queue to process nodes level by level — each node's children are added to the back of the queue." }
      ]
    },
    "trees-graphs": {
      0: [
        { question: "What traversal of a BST gives elements in sorted order?", options: ["Preorder", "Postorder", "Inorder", "Level-order"], correctAnswer: 2, explanation: "Inorder traversal visits left → root → right, which for a BST produces elements in ascending order." },
        { question: "What is the time complexity of finding the maximum depth of a binary tree?", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], correctAnswer: 2, explanation: "We must visit every node once to determine the maximum depth — O(n) time." }
      ],
      1: [
        { question: "Which algorithm finds the shortest path in an unweighted graph?", options: ["DFS", "BFS", "Dijkstra's", "Floyd-Warshall"], correctAnswer: 1, explanation: "BFS explores nodes level by level, so the first time it reaches a node, that's the shortest path in an unweighted graph." },
        { question: "What is topological sort used for?", options: ["Sorting numbers", "Task scheduling with dependencies", "Finding shortest paths", "Balancing trees"], correctAnswer: 1, explanation: "Topological sort orders tasks so that dependencies come before dependent tasks — essential for build systems and package managers." },
        { question: "How can you detect a cycle in a directed graph?", options: ["BFS only", "DFS with back edge detection", "Sorting the nodes", "Using a stack"], correctAnswer: 1, explanation: "During DFS, if you encounter a node that's currently in the recursion stack (back edge), a cycle exists." }
      ],
      2: [
        { question: "What is the height of a balanced BST with n nodes?", options: ["O(n)", "O(n²)", "O(log n)", "O(1)"], correctAnswer: 2, explanation: "A balanced BST maintains height O(log n), ensuring efficient search, insert, and delete operations." },
        { question: "Which tree guarantees O(log n) operations?", options: ["Binary tree", "BST", "AVL tree", "Linked list"], correctAnswer: 2, explanation: "AVL trees are self-balancing BSTs that maintain a height difference of at most 1 between subtrees, guaranteeing O(log n) operations." }
      ]
    },
    "dynamic-programming": {
      0: [
        { question: "What two properties must a problem have to be solvable by DP?", options: ["Sorting + Searching", "Overlapping subproblems + Optimal substructure", "Recursion + Iteration", "Arrays + Strings"], correctAnswer: 1, explanation: "DP requires overlapping subproblems (same subproblems solved repeatedly) and optimal substructure (optimal solution built from optimal sub-solutions)." },
        { question: "What is the difference between memoization and tabulation?", options: ["They are the same", "Memoization is top-down, tabulation is bottom-up", "Memoization is faster", "Tabulation uses recursion"], correctAnswer: 1, explanation: "Memoization (top-down) uses recursion with caching. Tabulation (bottom-up) fills a table iteratively from base cases." }
      ],
      1: [
        { question: "What is the time complexity of the Longest Common Subsequence (LCS) algorithm?", options: ["O(n)", "O(n log n)", "O(m × n)", "O(2^n)"], correctAnswer: 2, explanation: "LCS uses a 2D DP table of size m × n, where m and n are the lengths of the two strings." },
        { question: "Edit distance is used in which real-world application?", options: ["Image processing", "Spell checkers and autocorrect", "Database indexing", "Network routing"], correctAnswer: 1, explanation: "Edit distance (Levenshtein distance) measures how many operations are needed to transform one string into another — the core of spell checking." }
      ],
      2: [
        { question: "In bitmask DP, how do you check if item i is in the set represented by mask?", options: ["mask % i", "(mask >> i) & 1", "mask[i]", "mask & i"], correctAnswer: 1, explanation: "Right-shifting mask by i positions and AND-ing with 1 checks if the i-th bit is set." },
        { question: "What is the time complexity of TSP with bitmask DP for n cities?", options: ["O(n!)", "O(2^n × n²)", "O(n³)", "O(n²)"], correctAnswer: 1, explanation: "Bitmask DP considers all 2^n subsets, and for each subset checks n possible last cities with n transitions — O(2^n × n²)." }
      ]
    },
    "sorting-searching": {
      0: [
        { question: "Which sorting algorithm is stable and uses O(n) extra space?", options: ["Quick Sort", "Merge Sort", "Heap Sort", "Selection Sort"], correctAnswer: 1, explanation: "Merge Sort is stable (preserves order of equal elements) and requires O(n) auxiliary space for merging." },
        { question: "What is the average time complexity of Quick Sort?", options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], correctAnswer: 1, explanation: "Quick Sort has O(n log n) average case. The worst case O(n²) occurs with poor pivot selection, which randomization prevents." }
      ],
      1: [
        { question: "What is 'binary search on answer'?", options: ["Searching a sorted array", "Binary searching the result space to find optimal value", "Using two binary searches", "Searching in a binary tree"], correctAnswer: 1, explanation: "Binary search on answer searches the range of possible results, checking feasibility at each midpoint to find the optimal answer." },
        { question: "In a rotated sorted array, how many sorted halves exist?", options: ["Zero", "One", "At least one", "Two"], correctAnswer: 2, explanation: "In a rotated sorted array, at least one half (left or right of mid) is always sorted, which binary search exploits." }
      ],
      2: [
        { question: "What is the average time complexity of hash table lookup?", options: ["O(n)", "O(log n)", "O(1)", "O(n²)"], correctAnswer: 2, explanation: "Hash tables compute the hash in O(1) and directly access the bucket. Collisions are rare with a good hash function." },
        { question: "What is the typical load factor threshold for resizing a hash table?", options: ["0.25", "0.50", "0.75", "1.0"], correctAnswer: 2, explanation: "Most implementations resize when load factor exceeds 0.75, balancing memory usage with collision probability." }
      ]
    },
    "recursion-backtracking": {
      0: [
        { question: "What must every recursive function have?", options: ["A loop", "A base case", "A global variable", "Multiple parameters"], correctAnswer: 1, explanation: "A base case is essential to stop recursion. Without it, the function calls itself infinitely, causing a stack overflow." },
        { question: "What is the time complexity of the recursive power function using divide & conquer?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], correctAnswer: 1, explanation: "By squaring the half-result, we halve the problem each time — O(log n) recursive calls." }
      ],
      1: [
        { question: "What is the backtracking template?", options: ["Sort → Search → Return", "Choose → Explore → Unchoose", "Divide → Conquer → Merge", "Push → Process → Pop"], correctAnswer: 1, explanation: "Backtracking follows Choose (make a decision) → Explore (recurse) → Unchoose (undo the decision and try alternatives)." },
        { question: "What is the time complexity of generating all subsets of n elements?", options: ["O(n)", "O(n²)", "O(2^n)", "O(n!)"], correctAnswer: 2, explanation: "Each element can be included or excluded, giving 2^n total subsets." }
      ]
    },
    "greedy-algorithms": {
      0: [
        { question: "When does a greedy algorithm work correctly?", options: ["Always", "When the problem has greedy choice property and optimal substructure", "Only for sorting", "When DP is too slow"], correctAnswer: 1, explanation: "Greedy works when making locally optimal choices leads to a globally optimal solution (greedy choice property + optimal substructure)." },
        { question: "What greedy algorithm finds the minimum spanning tree?", options: ["Dijkstra's", "Kruskal's/Prim's", "Bellman-Ford", "Floyd-Warshall"], correctAnswer: 1, explanation: "Kruskal's (sort edges, add smallest that doesn't form cycle) and Prim's (grow tree from a vertex) both use greedy strategies for MST." }
      ]
    }
  },
  aptitude: {
    "number-systems": {
      0: [
        { question: "What is the remainder when 7^100 is divided by 4?", options: ["0", "1", "2", "3"], correctAnswer: 1, explanation: "7 mod 4 = 3, 3² mod 4 = 1. Since 100 is even, 7^100 mod 4 = (3²)^50 mod 4 = 1^50 = 1." },
        { question: "The HCF of two numbers is 12 and their LCM is 360. If one number is 60, what is the other?", options: ["36", "48", "72", "84"], correctAnswer: 2, explanation: "HCF × LCM = Product of two numbers. So 12 × 360 = 60 × x → x = 72." },
        { question: "How many factors does 120 have?", options: ["8", "12", "16", "20"], correctAnswer: 1, explanation: "120 = 2³ × 3 × 5. Number of factors = (3+1)(1+1)(1+1) = 4 × 2 × 2 = 16." }
      ],
      1: [
        { question: "What is the sum of the first 50 natural numbers?", options: ["1225", "1250", "1275", "1300"], correctAnswer: 2, explanation: "Sum = n(n+1)/2 = 50 × 51/2 = 1275." },
        { question: "In an AP with first term 3 and common difference 5, what is the 10th term?", options: ["45", "48", "50", "53"], correctAnswer: 1, explanation: "nth term = a + (n-1)d = 3 + 9×5 = 48." },
        { question: "The sum of an infinite GP with first term 4 and common ratio 1/3 is:", options: ["4", "6", "8", "12"], correctAnswer: 1, explanation: "Sum of infinite GP = a/(1-r) = 4/(1-1/3) = 4/(2/3) = 6." }
      ]
    },
    "percentages-ratios": {
      0: [
        { question: "A price increases by 20% then decreases by 20%. What is the net change?", options: ["0%", "-4%", "+4%", "-2%"], correctAnswer: 1, explanation: "Net change = 20 + (-20) + (20×-20/100) = -4%. The price ends up 4% lower than the original." },
        { question: "If 30% of x equals 40% of 150, what is x?", options: ["180", "200", "150", "160"], correctAnswer: 1, explanation: "0.3x = 0.4 × 150 = 60. So x = 60/0.3 = 200." },
        { question: "A student scores 70% in English and 80% in Math. If both have equal weightage, what is the average?", options: ["70%", "75%", "80%", "85%"], correctAnswer: 1, explanation: "Average = (70 + 80)/2 = 150/2 = 75%." }
      ],
      1: [
        { question: "A shopkeeper marks goods 50% above CP and gives 20% discount. What is the profit%?", options: ["30%", "25%", "20%", "15%"], correctAnswer: 2, explanation: "Net effect = 50 + (-20) + (50×-20/100) = 50 - 20 - 10 = 20% profit." },
        { question: "If a value increases by 25%, by what percent should it decrease to return to original?", options: ["20%", "25%", "33.33%", "50%"], correctAnswer: 0, explanation: "If increased by 25%, new value = 1.25x. To get back to x: 1.25x × (1-y) = x → 1-y = 0.8 → y = 20%." },
        { question: "A mixture contains milk and water in ratio 3:2. What percent is milk?", options: ["40%", "50%", "60%", "66.67%"], correctAnswer: 2, explanation: "Total parts = 3+2 = 5. Milk percentage = (3/5) × 100 = 60%." }
      ],
      2: [
        { question: "If A:B = 2:3 and B:C = 4:5, what is A:B:C?", options: ["2:3:5", "8:12:15", "4:6:5", "2:4:5"], correctAnswer: 1, explanation: "Make B common: A:B = 8:12, B:C = 12:15. So A:B:C = 8:12:15." },
        { question: "If x:y = 5:7, and y:z = 14:15, what is x:y:z?", options: ["5:7:7.5", "10:14:15", "5:14:15", "70:98:105"], correctAnswer: 1, explanation: "Make y common: x:y = 10:14, y:z = 14:15. So x:y:z = 10:14:15." },
        { question: "In a ratio 3:4, if the second quantity is 36, what is the first?", options: ["27", "30", "45", "48"], correctAnswer: 0, explanation: "If 3:4 = x:36, then x = (3 × 36)/4 = 108/4 = 27." }
      ]
    },
    "time-work": {
      0: [
        { question: "A can do a job in 10 days, B in 15 days. Working together, how many days?", options: ["5", "6", "7", "8"], correctAnswer: 1, explanation: "LCM(10,15)=30. A's rate=3/day, B's rate=2/day. Combined=5/day. Time=30/5=6 days." },
        { question: "If A is twice as efficient as B, and B finishes in 24 days, how long does A take?", options: ["48 days", "24 days", "12 days", "6 days"], correctAnswer: 2, explanation: "Twice as efficient means half the time. A takes 24/2 = 12 days." },
        { question: "A does 1/3 of work in 10 days. How long for complete work?", options: ["20 days", "25 days", "30 days", "35 days"], correctAnswer: 2, explanation: "If 1/3 work = 10 days, then total work = 10 × 3 = 30 days." }
      ],
      1: [
        { question: "Pipe A fills a tank in 20 min, Pipe B empties it in 30 min. Both open — when does it fill?", options: ["60 min", "50 min", "45 min", "Never"], correctAnswer: 0, explanation: "LCM(20,30)=60. A's rate=+3, B's rate=-2. Net=1 unit/min. Time=60/1=60 min." },
        { question: "A fills a tank in 4 hours, B in 6 hours, C empties in 8 hours. All open — time to fill?", options: ["2.4 hours", "3 hours", "4 hours", "6 hours"], correctAnswer: 0, explanation: "A's rate = 1/4, B's rate = 1/6, C's rate = -1/8. Combined = 6/24 + 4/24 - 3/24 = 7/24. Time = 24/7 ≈ 2.4 hours." },
        { question: "Average speed for a round trip at 40 km/h and 60 km/h is:", options: ["50 km/h", "48 km/h", "52 km/h", "45 km/h"], correctAnswer: 1, explanation: "Average speed for equal distances = 2×40×60/(40+60) = 4800/100 = 48 km/h. NOT the arithmetic mean." }
      ],
      2: [
        { question: "A car travels 100 km at 50 km/h and 200 km at 100 km/h. Average speed?", options: ["80 km/h", "75 km/h", "66.67 km/h", "70 km/h"], correctAnswer: 2, explanation: "Total distance = 300 km. Total time = 2 + 2 = 4 hours. Average speed = 300/4 = 75 km/h." },
        { question: "If A works for 5 days and B works for 3 days, they complete a job. If A works 3 days and B works 4 days, they still complete it. What is A's work rate?", options: ["1/5", "1/4", "1/7", "2/7"], correctAnswer: 2, explanation: "5a + 3b = 1 and 3a + 4b = 1. Solving: a = 1/7 (A completes 1/7 of job per day)." },
        { question: "Two workers together take 6 days. One alone takes 9 days. How long for the other alone?", options: ["15 days", "18 days", "12 days", "10 days"], correctAnswer: 1, explanation: "Combined rate = 1/6. First worker rate = 1/9. Second = 1/6 - 1/9 = 1/18. Time = 18 days." }
      ]
    },
    "logical-reasoning": {
      0: [
        { question: "'All dogs are animals. Some animals are pets.' Which conclusion is valid?", options: ["All dogs are pets", "Some dogs are pets", "Some animals are dogs", "No dogs are pets"], correctAnswer: 2, explanation: "Since all dogs are animals, it's always true that some animals are dogs. 'Some dogs are pets' is not guaranteed." }
      ],
      1: [
        { question: "In a circular seating arrangement of 6 people, how many unique arrangements are there?", options: ["720", "120", "360", "60"], correctAnswer: 1, explanation: "Circular arrangements of n people = (n-1)! = 5! = 120." }
      ],
      2: [
        { question: "If APPLE is coded as 17753, what is the code for PALE?", options: ["7153", "1753", "7135", "5173"], correctAnswer: 0, explanation: "A=1, P=7, L=5, E=3. PALE = 7-1-5-3 = 7153." }
      ],
      3: [
        { question: "To find 1 heavy coin among 9 using a balance, minimum weighings needed?", options: ["1", "2", "3", "4"], correctAnswer: 1, explanation: "Split into 3 groups of 3. First weighing identifies the heavy group. Second weighing within that group finds the heavy coin." }
      ]
    },
    "data-interpretation": {
      0: [
        { question: "A company's revenue was ₹200 Cr in Year 1 and ₹250 Cr in Year 2. What is the growth rate?", options: ["20%", "25%", "50%", "125%"], correctAnswer: 1, explanation: "Growth rate = (250-200)/200 × 100 = 25%." }
      ]
    },
    "permutations-probability": {
      0: [
        { question: "How many ways can 5 people be arranged in a line?", options: ["25", "60", "120", "720"], correctAnswer: 2, explanation: "5! = 5×4×3×2×1 = 120." },
        { question: "How many 3-letter words can be formed from ABCDE without repetition?", options: ["60", "120", "125", "10"], correctAnswer: 0, explanation: "5P3 = 5!/(5-3)! = 5×4×3 = 60." }
      ],
      1: [
        { question: "Two dice are rolled. What is P(sum = 7)?", options: ["1/12", "1/6", "1/9", "1/36"], correctAnswer: 1, explanation: "Favorable outcomes: (1,6)(2,5)(3,4)(4,3)(5,2)(6,1) = 6 out of 36 total. P = 6/36 = 1/6." },
        { question: "If P(A) = 0.3 and P(B) = 0.4 and A,B are independent, what is P(A and B)?", options: ["0.7", "0.12", "0.1", "0.70"], correctAnswer: 1, explanation: "For independent events, P(A and B) = P(A) × P(B) = 0.3 × 0.4 = 0.12." }
      ]
    }
  },
  hr: {
    "tell-me-about-yourself": {
      0: [
        { question: "What is the recommended framework for 'Tell me about yourself'?", options: ["Chronological order", "Present-Past-Future", "Education first", "Hobbies and interests"], correctAnswer: 1, explanation: "Present-Past-Future starts with your current role, highlights past achievements, and connects to why you want this opportunity." },
        { question: "How long should your introduction be?", options: ["30 seconds", "60-90 seconds", "3-5 minutes", "As long as needed"], correctAnswer: 1, explanation: "60-90 seconds is ideal — concise enough to maintain interest, long enough to convey key strengths." }
      ],
      1: [
        { question: "When asked 'Why should we hire you?', what should you focus on?", options: ["Your education", "Matching your skills to their needs", "Your salary expectations", "Previous company names"], correctAnswer: 1, explanation: "Match your top 3 skills/achievements to their top 3 requirements — show you're the solution to their specific needs." }
      ]
    },
    "star-method": {
      0: [
        { question: "What does STAR stand for?", options: ["Skills, Tasks, Actions, Reviews", "Situation, Task, Action, Result", "Strategy, Timeline, Approach, Review", "Strength, Teamwork, Achievement, Reward"], correctAnswer: 1, explanation: "STAR = Situation (context), Task (your responsibility), Action (what YOU did), Result (quantified outcome)." },
        { question: "Which part of STAR should you spend the most time on?", options: ["Situation", "Task", "Action", "Result"], correctAnswer: 2, explanation: "The Action section should be the longest — detail the specific steps YOU took. Use 'I' not 'we'." }
      ],
      1: [
        { question: "When answering 'Tell me about a failure', what should you avoid?", options: ["A real failure", "Taking responsibility", "Humble brags disguised as failures", "Showing what you learned"], correctAnswer: 2, explanation: "Avoid humble brags like 'I worked too hard' — interviewers see through them. Share a genuine failure with real learnings." }
      ]
    },
    "conflict-resolution": {
      0: [
        { question: "When describing a workplace conflict, what should you never do?", options: ["Explain the situation", "Show empathy", "Badmouth a colleague", "Describe the resolution"], correctAnswer: 2, explanation: "Never badmouth colleagues or former employers. Focus on the problem, not the person, and show a constructive outcome." }
      ],
      1: [
        { question: "What is the best way to disagree with your manager?", options: ["Escalate immediately to their boss", "Stay silent and comply", "Present data-backed concerns privately", "Complain to coworkers"], correctAnswer: 2, explanation: "Present your concerns privately with data and a proposed alternative. This shows initiative without undermining authority." }
      ]
    },
    "leadership-teamwork": {
      0: [
        { question: "What is 'leadership without authority'?", options: ["Being a manager", "Influencing outcomes through initiative, not title", "Refusing to follow orders", "Working alone"], correctAnswer: 1, explanation: "Leadership without authority means influencing outcomes, mentoring others, and driving initiatives even without a formal leadership title." }
      ]
    },
    "salary-negotiation": {
      0: [
        { question: "When should you discuss salary in the interview process?", options: ["First interview", "After receiving the offer", "During the phone screen", "In the application form"], correctAnswer: 1, explanation: "Negotiate after receiving the offer when you have maximum leverage. Discussing too early weakens your position." }
      ],
      1: [
        { question: "What should you consider beyond base salary?", options: ["Only the base salary matters", "Equity, bonus, benefits, and learning opportunities", "Just the company name", "Only the team size"], correctAnswer: 1, explanation: "Total compensation includes base, equity/RSUs, bonus, health insurance, learning budgets, and other benefits." }
      ]
    },
    "workplace-scenarios": {
      0: [
        { question: "If you discover a data privacy issue in your team's product, what should you do first?", options: ["Ignore it", "Post about it on social media", "Verify and document the issue", "Immediately quit"], correctAnswer: 2, explanation: "First verify your understanding, document the issue, then raise it through proper channels (manager, compliance team)." }
      ]
    }
  },
  "system-design": {
    "scalability-basics": {
      0: [
        { question: "What is the main advantage of horizontal scaling over vertical scaling?", options: ["Simpler architecture", "Virtually unlimited scaling", "Cheaper individual servers", "No load balancer needed"], correctAnswer: 1, explanation: "Horizontal scaling adds more machines, so there's virtually no upper limit. Vertical scaling hits physical hardware limits." },
        { question: "Which load balancing algorithm ensures the same client always reaches the same server?", options: ["Round-robin", "Least connections", "IP hash", "Random"], correctAnswer: 2, explanation: "IP hash uses the client's IP to deterministically route to the same server — useful for session affinity." }
      ],
      1: [
        { question: "In cache-aside pattern, what happens on a cache miss?", options: ["Return error", "Query DB, store in cache, return", "Delete the cache key", "Wait and retry"], correctAnswer: 1, explanation: "On cache miss: query the database, store the result in cache with TTL, then return the response." },
        { question: "What is a cache stampede?", options: ["Cache running out of memory", "Multiple requests rebuilding the same expired cache simultaneously", "Writing too much to cache", "Cache server crashing"], correctAnswer: 1, explanation: "When a popular cache key expires, many concurrent requests all try to rebuild it at once, overloading the database." }
      ],
      2: [
        { question: "What is a CDN edge server?", options: ["The origin server", "A server closest to end users", "A database replica", "A load balancer"], correctAnswer: 1, explanation: "Edge servers are CDN nodes distributed globally, serving cached content from locations nearest to users for minimal latency." }
      ]
    },
    "database-design": {
      0: [
        { question: "When would you choose a document database over SQL?", options: ["When you need complex joins", "When data has flexible/nested schemas", "When ACID transactions are critical", "When data is highly relational"], correctAnswer: 1, explanation: "Document databases like MongoDB excel with flexible, nested data structures that don't fit neatly into tables." },
        { question: "Which database type is best for social network friend connections?", options: ["Key-Value", "Relational", "Graph", "Wide-Column"], correctAnswer: 2, explanation: "Graph databases like Neo4j are optimized for relationship traversals — finding friends-of-friends is a natural graph query." }
      ],
      1: [
        { question: "What does a database index trade off?", options: ["Read speed for write speed", "Disk space for network speed", "CPU for memory", "Nothing — indexes are free"], correctAnswer: 0, explanation: "Indexes speed up reads but slow down writes (each write must update the index) and use additional disk space." },
        { question: "In a composite index on (A, B), which query can use it?", options: ["WHERE B = x", "WHERE A = x", "WHERE B = x AND A = y (B first)", "None of these"], correctAnswer: 1, explanation: "Composite indexes follow the leftmost prefix rule. WHERE A = x can use the index, but WHERE B = x alone cannot." }
      ],
      2: [
        { question: "What is the biggest challenge with database sharding?", options: ["Storing data", "Cross-shard queries", "Reading data", "Creating indexes"], correctAnswer: 1, explanation: "Cross-shard queries require scatter-gather across all shards, which is expensive. Good shard key design minimizes these." }
      ]
    },
    "api-design": {
      0: [
        { question: "Which HTTP method should be used to create a new resource?", options: ["GET", "PUT", "POST", "DELETE"], correctAnswer: 2, explanation: "POST is used to create new resources. GET reads, PUT updates/replaces, DELETE removes." },
        { question: "What status code should an API return when a resource is not found?", options: ["200", "400", "404", "500"], correctAnswer: 2, explanation: "404 Not Found indicates the requested resource doesn't exist. 400 is for bad requests, 500 for server errors." }
      ],
      1: [
        { question: "What problem does GraphQL solve that REST doesn't?", options: ["Security", "Over-fetching and under-fetching", "Server-side rendering", "Database access"], correctAnswer: 1, explanation: "GraphQL lets clients request exactly the fields they need in a single query, eliminating REST's over-fetching (too many fields) and under-fetching (multiple round trips)." },
        { question: "In the token bucket rate limiting algorithm, what happens when the bucket is empty?", options: ["Server crashes", "Request is queued forever", "429 Too Many Requests is returned", "Request goes through anyway"], correctAnswer: 2, explanation: "When no tokens are available, the request is rejected with HTTP 429, and the client should retry after the Retry-After period." }
      ]
    },
    microservices: {
      0: [
        { question: "What is the 'database per service' pattern?", options: ["All services share one database", "Each microservice owns its own database", "Services use only NoSQL", "One service manages all databases"], correctAnswer: 1, explanation: "Each microservice owns its data store — no shared databases. This ensures loose coupling and independent deployment." },
        { question: "What does a circuit breaker pattern prevent?", options: ["SQL injection", "Cascade failures across services", "Memory leaks", "Data loss"], correctAnswer: 1, explanation: "Circuit breakers detect failing services and stop routing requests to them, preventing one failure from cascading through the entire system." }
      ],
      1: [
        { question: "What is event sourcing?", options: ["Logging errors", "Storing events instead of current state", "Sending emails on events", "Real-time streaming"], correctAnswer: 1, explanation: "Event sourcing stores every state change as an immutable event. Current state is derived by replaying events — providing a complete audit trail." }
      ]
    },
    "realtime-systems": {
      0: [
        { question: "What is the main advantage of WebSockets over HTTP polling?", options: ["Better security", "Persistent bidirectional connection with low latency", "Simpler implementation", "Works without internet"], correctAnswer: 1, explanation: "WebSockets maintain a persistent connection for real-time bidirectional communication, eliminating the overhead of repeated HTTP requests." },
        { question: "How many concurrent WebSocket connections can a single server typically handle?", options: ["100", "1,000", "~50,000", "1 million"], correctAnswer: 2, explanation: "A single server can typically handle ~50K concurrent WebSocket connections, depending on memory and the complexity of message handling." }
      ],
      1: [
        { question: "Why do notification systems batch similar notifications?", options: ["To save server costs", "To avoid spamming users and causing notification fatigue", "Because of technical limitations", "To hide data"], correctAnswer: 1, explanation: "Batching ('John and 9 others liked your post') prevents notification fatigue. Too many notifications cause users to disable them entirely." }
      ]
    },
    "system-design-interviews": {
      0: [
        { question: "What is the first step in a system design interview?", options: ["Draw the architecture", "Clarify requirements", "Estimate scale", "Choose the database"], correctAnswer: 1, explanation: "Always start by clarifying functional and non-functional requirements. Designing without understanding requirements leads to wrong solutions." },
        { question: "For a read-heavy system with a 100:1 read/write ratio, what should you optimize for?", options: ["Write throughput", "Read latency with caching", "Storage space", "Network bandwidth"], correctAnswer: 1, explanation: "Read-heavy systems benefit most from caching and read replicas to serve the majority of requests without hitting the primary database." }
      ],
      1: [
        { question: "In a URL shortener, why is Base62 encoding used?", options: ["For encryption", "To create short alphanumeric codes from numeric IDs", "For compression", "For hashing"], correctAnswer: 1, explanation: "Base62 (a-z, A-Z, 0-9) converts numeric IDs into short alphanumeric strings. 62^7 ≈ 3.5 trillion unique codes." },
        { question: "Should a URL shortener use 301 or 302 redirects for analytics?", options: ["301 (permanent)", "302 (temporary)", "Both work equally", "Neither — use 200"], correctAnswer: 1, explanation: "302 (temporary) redirect ensures every click goes through your server for tracking. 301 (permanent) gets cached by browsers, losing analytics data." }
      ]
    }
  }
};
