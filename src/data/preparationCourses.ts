export interface Lesson {
  title: string;
  content: string;
  keyPoints: string[];
  example?: string;
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
            content: "Arrays are the most fundamental data structure in programming. They store elements in contiguous memory locations, providing O(1) access time by index. Understanding arrays is crucial because they form the basis of many other data structures.",
            keyPoints: [
              "Arrays have O(1) random access and O(n) search time",
              "Insertion and deletion at the end is O(1), but O(n) in the middle",
              "Arrays are cache-friendly due to contiguous memory allocation",
              "Dynamic arrays (like JavaScript arrays) automatically resize"
            ],
            example: "// Two Pointer Technique — finding a pair that sums to target\nfunction twoSum(arr: number[], target: number): [number, number] {\n  let left = 0, right = arr.length - 1;\n  arr.sort((a, b) => a - b);\n  while (left < right) {\n    const sum = arr[left] + arr[right];\n    if (sum === target) return [arr[left], arr[right]];\n    sum < target ? left++ : right--;\n  }\n  return [-1, -1];\n}"
          },
          {
            title: "String Manipulation Patterns",
            content: "Strings are immutable sequences of characters. Many interview problems involve pattern matching, substring searches, and character frequency analysis. The sliding window technique is particularly powerful for string problems.",
            keyPoints: [
              "Strings are immutable in most languages — modifications create new strings",
              "Use hash maps for character frequency counting",
              "Sliding window technique works well for substring problems",
              "Two-pointer approach is effective for palindrome checks"
            ],
            example: "// Sliding Window — longest substring without repeating characters\nfunction lengthOfLongestSubstring(s: string): number {\n  const seen = new Map<string, number>();\n  let maxLen = 0, start = 0;\n  for (let end = 0; end < s.length; end++) {\n    if (seen.has(s[end]) && seen.get(s[end])! >= start) {\n      start = seen.get(s[end])! + 1;\n    }\n    seen.set(s[end], end);\n    maxLen = Math.max(maxLen, end - start + 1);\n  }\n  return maxLen;\n}"
          },
          {
            title: "Common Array Algorithms",
            content: "Several classic algorithms frequently appear in interviews. These include Kadane's algorithm for maximum subarray sum, the Dutch National Flag problem for sorting, and prefix sum techniques for range queries.",
            keyPoints: [
              "Kadane's Algorithm: O(n) max subarray sum",
              "Prefix Sum: Precompute cumulative sums for O(1) range queries",
              "Dutch National Flag: Three-way partition in O(n)",
              "Boyer-Moore Voting: Find majority element in O(n) time, O(1) space"
            ],
            example: "// Kadane's Algorithm — Maximum Subarray Sum\nfunction maxSubArray(nums: number[]): number {\n  let maxSum = nums[0], currentSum = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    currentSum = Math.max(nums[i], currentSum + nums[i]);\n    maxSum = Math.max(maxSum, currentSum);\n  }\n  return maxSum;\n}"
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
            content: "Linked lists consist of nodes where each node contains data and a reference to the next node. Unlike arrays, they allow efficient insertion and deletion at any position but sacrifice random access.",
            keyPoints: [
              "Singly linked: each node points to the next",
              "Doubly linked: each node has prev and next pointers",
              "Insertion/deletion is O(1) if you have the node reference",
              "Use a dummy head node to simplify edge cases"
            ],
            example: "// Reverse a Linked List\nfunction reverseList(head: ListNode | null): ListNode | null {\n  let prev = null, curr = head;\n  while (curr) {\n    const next = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = next;\n  }\n  return prev;\n}"
          },
          {
            title: "Stack Applications",
            content: "Stacks follow LIFO (Last In, First Out) principle. They are essential for expression evaluation, backtracking algorithms, and maintaining state history. The call stack itself is the most well-known stack.",
            keyPoints: [
              "LIFO: Last In, First Out ordering",
              "Common uses: undo functionality, expression parsing, DFS",
              "Monotonic stack solves next greater/smaller element problems",
              "Use stacks for matching brackets and parentheses"
            ],
            example: "// Valid Parentheses\nfunction isValid(s: string): boolean {\n  const stack: string[] = [];\n  const map: Record<string, string> = { ')': '(', ']': '[', '}': '{' };\n  for (const char of s) {\n    if ('({['.includes(char)) stack.push(char);\n    else if (stack.pop() !== map[char]) return false;\n  }\n  return stack.length === 0;\n}"
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
            content: "Binary trees are hierarchical structures where each node has at most two children. Tree traversals (inorder, preorder, postorder) are fundamental operations. BSTs maintain sorted order for efficient search.",
            keyPoints: [
              "Inorder traversal of BST gives sorted order",
              "BFS uses a queue; DFS uses recursion or a stack",
              "Height-balanced trees ensure O(log n) operations",
              "Common problems: LCA, diameter, max depth, path sum"
            ],
            example: "// Inorder Traversal (Iterative)\nfunction inorder(root: TreeNode | null): number[] {\n  const result: number[] = [], stack: TreeNode[] = [];\n  let curr = root;\n  while (curr || stack.length) {\n    while (curr) { stack.push(curr); curr = curr.left; }\n    curr = stack.pop()!;\n    result.push(curr.val);\n    curr = curr.right;\n  }\n  return result;\n}"
          },
          {
            title: "Graph Algorithms",
            content: "Graphs model relationships between entities. BFS finds shortest paths in unweighted graphs, while DFS is useful for cycle detection and topological sorting. Understanding adjacency lists and matrices is essential.",
            keyPoints: [
              "BFS: Level-order, shortest path in unweighted graphs",
              "DFS: Cycle detection, connected components, topological sort",
              "Dijkstra's: Shortest path in weighted graphs",
              "Union-Find: Efficient connected component tracking"
            ],
            example: "// BFS — Shortest Path\nfunction bfs(graph: Map<number, number[]>, start: number, end: number): number {\n  const queue: [number, number][] = [[start, 0]];\n  const visited = new Set([start]);\n  while (queue.length) {\n    const [node, dist] = queue.shift()!;\n    if (node === end) return dist;\n    for (const neighbor of graph.get(node) || []) {\n      if (!visited.has(neighbor)) {\n        visited.add(neighbor);\n        queue.push([neighbor, dist + 1]);\n      }\n    }\n  }\n  return -1;\n}"
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
            content: "Dynamic programming solves complex problems by breaking them into overlapping subproblems. The two approaches are top-down (memoization) and bottom-up (tabulation). Identifying the state and transition is the key skill.",
            keyPoints: [
              "Overlapping subproblems + optimal substructure = DP candidate",
              "Top-down: Recursive with memoization cache",
              "Bottom-up: Iterative with tabulation array",
              "Common patterns: 0/1 Knapsack, LCS, LIS, coin change"
            ],
            example: "// Fibonacci — Bottom-Up DP\nfunction fib(n: number): number {\n  if (n <= 1) return n;\n  let prev = 0, curr = 1;\n  for (let i = 2; i <= n; i++) {\n    [prev, curr] = [curr, prev + curr];\n  }\n  return curr;\n}\n\n// 0/1 Knapsack\nfunction knapsack(weights: number[], values: number[], W: number): number {\n  const n = weights.length;\n  const dp = Array(W + 1).fill(0);\n  for (let i = 0; i < n; i++)\n    for (let w = W; w >= weights[i]; w--)\n      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);\n  return dp[W];\n}"
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
              "Merge Sort: O(n log n) stable, uses extra space",
              "Quick Sort: O(n log n) average, in-place, unstable",
              "Counting Sort: O(n + k) for small range integers",
              "Know the best/worst/average cases for each"
            ],
            example: "// Merge Sort\nfunction mergeSort(arr: number[]): number[] {\n  if (arr.length <= 1) return arr;\n  const mid = Math.floor(arr.length / 2);\n  const left = mergeSort(arr.slice(0, mid));\n  const right = mergeSort(arr.slice(mid));\n  return merge(left, right);\n}\nfunction merge(a: number[], b: number[]): number[] {\n  const result: number[] = [];\n  let i = 0, j = 0;\n  while (i < a.length && j < b.length)\n    result.push(a[i] < b[j] ? a[i++] : b[j++]);\n  return [...result, ...a.slice(i), ...b.slice(j)];\n}"
          },
          {
            title: "Binary Search Variations",
            content: "Binary search is not just for sorted arrays. It can be applied to search spaces, rotated arrays, and answer-based problems. The key insight is identifying a monotonic property to binary search on.",
            keyPoints: [
              "Classic binary search: O(log n) on sorted arrays",
              "Search in rotated sorted array: modified binary search",
              "Binary search on answer: minimize/maximize a value",
              "Lower/upper bound: find first/last occurrence"
            ],
            example: "// Binary Search — First Occurrence\nfunction lowerBound(arr: number[], target: number): number {\n  let lo = 0, hi = arr.length;\n  while (lo < hi) {\n    const mid = (lo + hi) >> 1;\n    arr[mid] < target ? lo = mid + 1 : hi = mid;\n  }\n  return lo;\n}"
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
            content: "Divisibility rules are shortcuts to determine if a number is divisible by another without performing division. These are incredibly useful for aptitude tests where speed matters.",
            keyPoints: [
              "Divisible by 2: last digit is even",
              "Divisible by 3: sum of digits is divisible by 3",
              "Divisible by 4: last two digits form a number divisible by 4",
              "Divisible by 9: sum of digits is divisible by 9",
              "Divisible by 11: alternating sum of digits is divisible by 11"
            ],
            example: "Example: Is 7,924 divisible by 4?\nCheck last two digits: 24 ÷ 4 = 6 ✓ Yes!\n\nIs 2,178 divisible by 11?\nAlternating sum: 2 - 1 + 7 - 8 = 0\n0 is divisible by 11 ✓ Yes!"
          },
          {
            title: "HCF & LCM",
            content: "HCF (Highest Common Factor) is the largest number that divides both numbers. LCM (Least Common Multiple) is the smallest number divisible by both. The relationship HCF × LCM = Product of numbers is frequently tested.",
            keyPoints: [
              "HCF using Euclidean algorithm: HCF(a,b) = HCF(b, a mod b)",
              "LCM = (a × b) / HCF(a, b)",
              "HCF of fractions: HCF of numerators / LCM of denominators",
              "LCM of fractions: LCM of numerators / HCF of denominators"
            ],
            example: "Find HCF and LCM of 12 and 18:\n\n12 = 2² × 3\n18 = 2 × 3²\n\nHCF = 2¹ × 3¹ = 6 (take minimum powers)\nLCM = 2² × 3² = 36 (take maximum powers)\n\nVerify: 6 × 36 = 216 = 12 × 18 ✓"
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
            content: "Percentages express a number as a fraction of 100. Quick mental math tricks can save significant time in aptitude tests. Understanding percentage change and successive percentages is key.",
            keyPoints: [
              "x% of y = y% of x (useful shortcut!)",
              "Percentage change = (Change / Original) × 100",
              "Successive changes: use (1 + r₁/100)(1 + r₂/100) - 1",
              "If price increases by x%, to restore: decrease by (x/(100+x))×100%"
            ],
            example: "A product's price increases by 20%, then decreases by 20%.\nIs the final price the same? NO!\n\nLet original = ₹100\nAfter 20% increase: ₹120\nAfter 20% decrease: ₹120 × 0.8 = ₹96\n\nNet change = -4% (not 0%!)\nFormula: (1.2)(0.8) - 1 = 0.96 - 1 = -0.04 = -4%"
          },
          {
            title: "Ratios & Proportions",
            content: "Ratios compare quantities. Direct proportion means both increase/decrease together. Inverse proportion means one increases as the other decreases. Mixture problems combine ratio concepts with averages.",
            keyPoints: [
              "If a:b = 2:3 and b:c = 4:5, then a:b:c = 8:12:15",
              "Alligation rule: a quick way to solve mixture problems",
              "Componendo-Dividendo: if a/b = c/d, then (a+b)/(a-b) = (c+d)/(c-d)",
              "Partnership: profit shared in ratio of (capital × time)"
            ],
            example: "Mix milk at ₹60/L with water (₹0/L) to get mixture at ₹45/L.\nRatio of milk to water?\n\nUsing Alligation:\n     60        0\n       \\     /\n        45\n       /     \\\n   45-0=45  60-45=15\n\nMilk : Water = 45 : 15 = 3 : 1"
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
            content: "Time and work problems use the concept that if a person can do a job in 'n' days, their one day's work is 1/n. The LCM method makes these problems much easier to solve by assuming total work as the LCM.",
            keyPoints: [
              "If A does work in 'a' days, A's 1 day work = 1/a",
              "LCM method: Assume total work = LCM of individual days",
              "If A is twice as efficient as B, A takes half the time",
              "Combined work rate = sum of individual work rates"
            ],
            example: "A can do a job in 12 days, B in 18 days. Together?\n\nLCM(12, 18) = 36 units (total work)\nA's rate = 36/12 = 3 units/day\nB's rate = 36/18 = 2 units/day\nCombined = 5 units/day\n\nTime = 36/5 = 7.2 days"
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
            content: "Syllogisms test your ability to draw valid conclusions from given statements. Use Venn diagrams to visualize relationships. Remember: 'All A are B' doesn't mean 'All B are A'.",
            keyPoints: [
              "All A are B: A is completely inside B",
              "Some A are B: A and B overlap",
              "No A are B: A and B don't overlap",
              "Draw all possible Venn diagrams to verify conclusions"
            ],
            example: "Statements:\n1. All dogs are animals\n2. Some animals are pets\n\nConclusions:\n✓ Some dogs are animals (Always true — subset relationship)\n✗ All animals are dogs (Invalid — only A⊂B, not B⊂A)\n✗ Some dogs are pets (Possibly true, but not definite)"
          },
          {
            title: "Seating Arrangements",
            content: "Seating arrangement problems require systematic tracking of positions. Create a diagram (linear or circular) and fill in information step by step, starting with the most constrained clues.",
            keyPoints: [
              "Linear: Fix one person, arrange others relative to them",
              "Circular: Fix one person to eliminate rotational symmetry",
              "Start with definite clues (exact positions), then relative ones",
              "Use elimination to narrow down possibilities"
            ],
            example: "6 people (A-F) sit in a row.\n• B sits next to D\n• A sits at one end\n• C is not adjacent to A\n\nStep 1: Place A at position 1\nStep 2: C cannot be at position 2\nStep 3: Try BD together in different positions\nStep 4: Fill remaining with constraints"
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
            content: "Data interpretation tests your ability to extract information from visual data and perform quick calculations. Speed is crucial — learn to approximate rather than calculate exact values when options are spread apart.",
            keyPoints: [
              "Bar charts: compare heights for relative values",
              "Pie charts: each 1% = 3.6°; use fractions for quick calc",
              "Line graphs: look at slopes for rate of change",
              "Tables: identify row/column relationships quickly",
              "Approximate when answer choices are far apart"
            ],
            example: "If a pie chart shows 30% for Marketing out of ₹5,00,000:\nMarketing spend = 30% × 5,00,000\n= 3 × 50,000 = ₹1,50,000\n\nTip: 30% = 3/10, so divide by 10 and multiply by 3.\nMuch faster than: 0.30 × 500000!"
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
            content: "This is usually the first question and sets the tone for the entire interview. Use the Present-Past-Future framework: start with your current role, highlight past achievements, and connect to why you're excited about this opportunity.",
            keyPoints: [
              "Keep it 60-90 seconds — concise and impactful",
              "Present: What you currently do and your key expertise",
              "Past: Relevant experience and achievements that led you here",
              "Future: Why this role/company excites you and how you'll contribute",
              "Avoid personal details unless relevant to the role"
            ],
            example: "\"I'm a full-stack developer with 3 years of experience specializing in React and Node.js. At my current company, I led the migration of our legacy system to a microservices architecture, which reduced deployment time by 60%. Before that, I built an internal tool that automated our QA process, saving 20 hours per week. I'm particularly excited about this role at [Company] because of your focus on developer experience tools — it aligns perfectly with my passion for building tools that make engineers more productive.\""
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
            content: "The STAR method provides a clear structure for answering behavioral questions. Interviewers use these to predict future behavior based on past experiences. Every behavioral answer should follow this format.",
            keyPoints: [
              "Situation: Set the scene with context (2-3 sentences)",
              "Task: Explain your specific responsibility",
              "Action: Detail the steps YOU took (use 'I', not 'we')",
              "Result: Quantify the outcome with metrics when possible",
              "Prepare 5-6 STAR stories that cover different competencies"
            ],
            example: "Q: Tell me about a time you handled a difficult deadline.\n\nS: \"Our team had a product launch in 3 weeks, but we discovered a critical security vulnerability.\"\n\nT: \"As the lead developer, I needed to fix the vulnerability without delaying the launch.\"\n\nA: \"I triaged the issue, broke it into 3 parallel workstreams, brought in a security specialist for code review, and set up daily standups to track progress.\"\n\nR: \"We patched the vulnerability in 10 days, launched on time, and the fix actually improved our auth system performance by 15%.\""
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
            content: "Conflict resolution questions test your emotional intelligence and professionalism. The key is showing you can disagree respectfully, seek to understand the other perspective, and focus on solutions rather than blame.",
            keyPoints: [
              "Never badmouth a colleague or previous employer",
              "Show empathy: acknowledge the other person's perspective",
              "Focus on the problem, not the person",
              "Describe a constructive outcome — what you learned",
              "Demonstrate that you escalate appropriately when needed"
            ],
            example: "Q: Describe a conflict with a coworker.\n\n\"A senior developer and I disagreed on the database choice for a new feature. He preferred MongoDB for flexibility; I advocated for PostgreSQL for data integrity. Instead of pushing my preference, I suggested we both create a proof-of-concept with benchmarks relevant to our use case. The data showed PostgreSQL was 40% faster for our query patterns. He appreciated the data-driven approach, and we went with PostgreSQL. Now I always propose benchmarks when there's a technical disagreement.\""
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
            content: "You don't need a 'lead' title to show leadership. Interviewers look for initiative, influence, mentorship, and the ability to rally a team around a goal. Focus on stories where you stepped up voluntarily.",
            keyPoints: [
              "Leadership = influence, not authority",
              "Show how you motivated or unblocked team members",
              "Mention mentoring junior developers or new hires",
              "Describe taking ownership of problems beyond your role",
              "Highlight collaborative decision-making"
            ],
            example: "\"When our team's sprint velocity dropped by 30%, I noticed the new developers were struggling with our codebase. Without being asked, I set up weekly 'code walkthrough' sessions and created an onboarding wiki. Within a month, the new developers were contributing independently, and our velocity recovered to 110% of the original baseline.\""
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
            content: "Salary negotiation is a normal part of the hiring process. Companies expect candidates to negotiate. Research market rates, know your value, and negotiate the total package — not just base salary.",
            keyPoints: [
              "Research market rates on Glassdoor, Levels.fyi, and LinkedIn",
              "Never give a number first — let the company make an offer",
              "If pressed, give a range based on market data",
              "Negotiate total compensation: base + bonus + equity + benefits",
              "Get the final offer in writing before accepting",
              "It's okay to ask for time to consider an offer"
            ],
            example: "When asked about salary expectations:\n\n✗ \"I'm looking for ₹15 LPA\" (too specific, too early)\n✓ \"I'd prefer to learn more about the role before discussing numbers. Can you share the budgeted range?\"\n\nWhen negotiating an offer:\n✓ \"Thank you for the offer of ₹12 LPA. Based on my research and the value I'll bring, I was expecting something closer to ₹15-16 LPA. Is there flexibility on the base, or could we explore other components like a signing bonus?\""
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
            content: "Scaling is about handling increased load. Vertical scaling (scale up) means adding more resources to a single machine. Horizontal scaling (scale out) means adding more machines. Modern systems prefer horizontal scaling for reliability.",
            keyPoints: [
              "Vertical: Bigger machine. Simple but has limits.",
              "Horizontal: More machines. Complex but virtually unlimited.",
              "Load balancers distribute traffic across servers",
              "Stateless services are easier to scale horizontally",
              "CDNs cache static content closer to users"
            ],
            example: "System: E-commerce website with 1M daily users\n\n1. Web tier: 4 app servers behind a load balancer (round-robin)\n2. Caching: Redis for session data + product catalog\n3. CDN: CloudFront for images, CSS, JS\n4. Database: Primary-replica setup with read replicas\n5. Result: Each server handles ~250K requests; if one fails, others absorb the load"
          },
          {
            title: "Caching Strategies",
            content: "Caching stores frequently accessed data in fast storage to reduce database load and latency. Understanding cache invalidation strategies is crucial — it's one of the hardest problems in computer science.",
            keyPoints: [
              "Cache-aside (Lazy): App checks cache, falls back to DB",
              "Write-through: Write to cache and DB simultaneously",
              "Write-behind: Write to cache, async write to DB",
              "TTL (Time-To-Live): Auto-expire cached data",
              "Cache invalidation: When underlying data changes, update/remove cache"
            ],
            example: "Cache-Aside Pattern:\n\n1. Request: GET /user/123\n2. Check Redis: cache MISS\n3. Query PostgreSQL: SELECT * FROM users WHERE id=123\n4. Store in Redis: SET user:123 {data} EX 3600\n5. Return response\n\nNext request for same user → cache HIT → ~1ms vs ~50ms"
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
            content: "The database choice depends on your data model, consistency requirements, and scale. SQL databases are great for structured data with complex queries. NoSQL databases excel at flexible schemas and horizontal scaling.",
            keyPoints: [
              "SQL (PostgreSQL, MySQL): ACID, complex joins, structured data",
              "Document DB (MongoDB): Flexible schema, nested data",
              "Key-Value (Redis): Ultra-fast reads, session/cache storage",
              "Wide-Column (Cassandra): High write throughput, time-series",
              "Graph DB (Neo4j): Relationship-heavy data"
            ],
            example: "Choosing a DB for a social media app:\n\n• User profiles → PostgreSQL (structured, relational)\n• News feed → Cassandra (high write throughput, time-ordered)\n• Sessions → Redis (fast read/write, auto-expiry)\n• Friend connections → Neo4j (graph traversals)\n• Media metadata → MongoDB (flexible schema)"
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
            content: "REST APIs use HTTP methods and URLs to represent resources. Good API design is intuitive, consistent, and handles errors gracefully. Pagination, versioning, and rate limiting are essential for production APIs.",
            keyPoints: [
              "Use nouns for resources: /users, /posts (not /getUsers)",
              "HTTP methods: GET (read), POST (create), PUT (update), DELETE",
              "Use proper status codes: 200, 201, 400, 401, 404, 500",
              "Paginate list endpoints: ?page=1&limit=20 or cursor-based",
              "Version your API: /api/v1/users"
            ],
            example: "Well-designed REST API:\n\nGET    /api/v1/users           → List users (paginated)\nGET    /api/v1/users/123       → Get user 123\nPOST   /api/v1/users           → Create user\nPUT    /api/v1/users/123       → Update user 123\nDELETE /api/v1/users/123       → Delete user 123\nGET    /api/v1/users/123/posts → User 123's posts\n\nError response:\n{ \"error\": { \"code\": \"NOT_FOUND\", \"message\": \"User 123 not found\" } }"
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
            content: "Microservices decompose a monolith into independent, deployable services. Each service owns its data and communicates via APIs or message queues. This enables independent scaling and deployment but adds operational complexity.",
            keyPoints: [
              "Single Responsibility: Each service does one thing well",
              "Database per service: No shared databases",
              "Communication: Sync (REST/gRPC) or Async (message queues)",
              "Service discovery: How services find each other",
              "Circuit breaker pattern: Prevent cascade failures"
            ],
            example: "E-commerce Microservices:\n\n┌─────────┐   ┌──────────┐   ┌─────────────┐\n│  User   │   │  Product │   │   Order     │\n│ Service │   │ Service  │   │  Service    │\n└────┬────┘   └────┬─────┘   └──────┬──────┘\n     │             │                │\n     └─────────────┼────────────────┘\n                   │\n           ┌───────┴───────┐\n           │ Message Queue │\n           │  (RabbitMQ)   │\n           └───────────────┘\n\nOrder placed → Event published → Inventory updated → Email sent"
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
            content: "Real-time systems deliver data to users instantly. WebSockets provide full-duplex communication. Pub/Sub patterns decouple publishers from subscribers. Event-driven architecture enables reactive systems.",
            keyPoints: [
              "WebSockets: Persistent connection, bidirectional",
              "Server-Sent Events: Server → Client only, simpler",
              "Pub/Sub: Decouple message producers from consumers",
              "Event sourcing: Store events, not state",
              "Long polling: Fallback when WebSockets aren't available"
            ],
            example: "Chat Application Architecture:\n\n1. Client connects via WebSocket to Chat Service\n2. Message sent → stored in DB + published to Redis Pub/Sub\n3. All connected servers receive the message\n4. Each server pushes to relevant connected clients\n5. Offline users: Store in 'unread' queue, deliver on reconnect\n\nScale: 1 server handles ~50K concurrent WebSocket connections\n→ 20 servers = 1M concurrent users"
          }
        ]
      }
    ]
  }
];
