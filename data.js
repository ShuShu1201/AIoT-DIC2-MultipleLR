// 50 Startups Dataset and ML Experiment Results
const EXPERIMENT_DATA = {
  methods: [
    {
      id: "forward",
      name: "Forward Selection",
      color: "#38bdf8", // Sky blue
      marker: "circle",
      dash: [],
      description: "逐步向前選取：從空模型開始，每一步貪婪加入能使訓練殘差（RSS）最小化的高效特徵。",
      kResults: [
        { k: 1, rmse: 8274.87, r2: 0.9465, features: ["R&D Spend"] },
        { k: 2, rmse: 8198.80, r2: 0.9474, features: ["R&D Spend", "Marketing Spend"] },
        { k: 3, rmse: 8803.78, r2: 0.9394, features: ["R&D Spend", "Marketing Spend", "Administration"] },
        { k: 4, rmse: 9068.54, r2: 0.9357, features: ["R&D Spend", "Marketing Spend", "Administration", "State_Florida"] },
        { k: 5, rmse: 9137.99, r2: 0.9347, features: ["R&D Spend", "Marketing Spend", "Administration", "State_Florida", "State_New York"] }
      ]
    },
    {
      id: "backward",
      name: "Backward Elimination",
      color: "#fb923c", // Orange
      marker: "rect",
      dash: [5, 5],
      description: "逐步向後剔除：從全變數模型出發，每一步刪除對模型貢獻最不顯著、殘差增加最小的冗餘特徵。",
      kResults: [
        { k: 1, rmse: 8274.87, r2: 0.9465, features: ["R&D Spend"] },
        { k: 2, rmse: 8198.80, r2: 0.9474, features: ["R&D Spend", "Marketing Spend"] },
        { k: 3, rmse: 8803.78, r2: 0.9394, features: ["R&D Spend", "Administration", "Marketing Spend"] },
        { k: 4, rmse: 9068.54, r2: 0.9357, features: ["R&D Spend", "Administration", "Marketing Spend", "State_Florida"] },
        { k: 5, rmse: 9137.99, r2: 0.9347, features: ["R&D Spend", "Administration", "Marketing Spend", "State_Florida", "State_New York"] }
      ]
    },
    {
      id: "lasso",
      name: "Lasso Regularization",
      color: "#4ade80", // Emerald Green
      marker: "triangle",
      dash: [6, 3, 2, 3],
      description: "Lasso L1 正則化：透過收縮懲罰係數自動篩選特徵，依據正則化係數權重排序選取。",
      kResults: [
        { k: 1, rmse: 8274.87, r2: 0.9465, features: ["R&D Spend"] },
        { k: 2, rmse: 8198.80, r2: 0.9474, features: ["R&D Spend", "Marketing Spend"] },
        { k: 3, rmse: 8309.06, r2: 0.9460, features: ["R&D Spend", "Marketing Spend", "State_New York"] },
        { k: 4, rmse: 8409.92, r2: 0.9447, features: ["R&D Spend", "Marketing Spend", "State_New York", "State_Florida"] },
        { k: 5, rmse: 9137.99, r2: 0.9347, features: ["R&D Spend", "Marketing Spend", "State_New York", "State_Florida", "Administration"] }
      ]
    },
    {
      id: "mi",
      name: "Mutual Information",
      color: "#f87171", // Coral Red
      marker: "diamond",
      dash: [2, 2],
      description: "互資訊（MI）：衡量特徵與目標變數間的非線性依賴相關性，依資訊量分數由高至低選取。",
      kResults: [
        { k: 1, rmse: 8274.87, r2: 0.9465, features: ["R&D Spend"] },
        { k: 2, rmse: 8198.80, r2: 0.9474, features: ["R&D Spend", "Marketing Spend"] },
        { k: 3, rmse: 8309.06, r2: 0.9460, features: ["R&D Spend", "Marketing Spend", "State_New York"] },
        { k: 4, rmse: 8409.92, r2: 0.9447, features: ["R&D Spend", "Marketing Spend", "State_New York", "State_Florida"] },
        { k: 5, rmse: 9137.99, r2: 0.9347, features: ["R&D Spend", "Marketing Spend", "State_New York", "State_Florida", "Administration"] }
      ]
    },
    {
      id: "best_subset",
      name: "Best Subset (Exhaustive)",
      color: "#c084fc", // Purple
      marker: "star",
      dash: [8, 3],
      description: "最佳子集（窮舉搜尋）：暴力遍歷每一特徵數量 k 下的所有組合，選取理論上訓練殘差最低者。",
      kResults: [
        { k: 1, rmse: 8274.87, r2: 0.9465, features: ["R&D Spend"] },
        { k: 2, rmse: 8198.80, r2: 0.9474, features: ["R&D Spend", "Marketing Spend"] },
        { k: 3, rmse: 8803.78, r2: 0.9394, features: ["R&D Spend", "Administration", "Marketing Spend"] },
        { k: 4, rmse: 9068.54, r2: 0.9357, features: ["R&D Spend", "Administration", "Marketing Spend", "State_Florida"] },
        { k: 5, rmse: 9137.99, r2: 0.9347, features: ["R&D Spend", "Administration", "Marketing Spend", "State_Florida", "State_New York"] }
      ]
    }
  ],

  // Models for dynamic real-time prediction
  predictionModels: {
    optimal_k2: {
      name: "最優特徵模型 (k=2: R&D + Marketing)",
      formula: "Profit = $46,346.34 + 0.7886 × (R&D) + 0.0326 × (Marketing)",
      intercept: 46346.33876,
      coefs: { rd: 0.788618, mkt: 0.032577, admin: 0, ny: 0, fl: 0 },
      rmse: 8198.80,
      r2: 0.9474
    },
    all_k5: {
      name: "全特徵基準模型 (k=5: 全部特徵)",
      formula: "Profit = $42,554.17 + 0.7735 × (R&D) + 0.0329 × (Admin) + 0.0366 × (Marketing) - 959.28 × (FL) + 699.37 × (NY)",
      intercept: 42554.16762,
      coefs: { rd: 0.773467, admin: 0.032885, mkt: 0.036610, fl: -959.28416, ny: 699.36905 },
      rmse: 9137.99,
      r2: 0.9347
    },
    lasso_k3: {
      name: "Lasso / MI 模型 (k=3: R&D + Marketing + New York)",
      formula: "Profit = $46,100.29 + 0.7859 × (R&D) + 0.0333 × (Marketing) + 864.00 × (New York)",
      intercept: 46100.29131,
      coefs: { rd: 0.785871, mkt: 0.033272, admin: 0, ny: 864.00187, fl: 0 },
      rmse: 8309.06,
      r2: 0.9460
    },
    forward_k3: {
      name: "Forward 模型 (k=3: R&D + Marketing + Administration)",
      formula: "Profit = $42,989.01 + 0.7788 × (R&D) + 0.0347 × (Marketing) + 0.0294 × (Administration)",
      intercept: 42989.00817,
      coefs: { rd: 0.778841, mkt: 0.034710, admin: 0.029392, ny: 0, fl: 0 },
      rmse: 8803.78,
      r2: 0.9394
    }
  },

  // Raw dataset records
  startups: [
    {"id": 1, "rd": 165349.2, "admin": 136897.8, "mkt": 471784.1, "state": "New York", "profit": 192261.83},
    {"id": 2, "rd": 162597.7, "admin": 151377.59, "mkt": 443898.53, "state": "California", "profit": 191792.06},
    {"id": 3, "rd": 153441.51, "admin": 101145.55, "mkt": 407934.54, "state": "Florida", "profit": 191050.39},
    {"id": 4, "rd": 144372.41, "admin": 118671.85, "mkt": 383199.62, "state": "New York", "profit": 182901.99},
    {"id": 5, "rd": 142107.34, "admin": 91391.77, "mkt": 366168.42, "state": "Florida", "profit": 166187.94},
    {"id": 6, "rd": 131876.9, "admin": 99814.71, "mkt": 362861.36, "state": "New York", "profit": 156991.12},
    {"id": 7, "rd": 134615.46, "admin": 147198.87, "mkt": 127716.82, "state": "California", "profit": 156122.51},
    {"id": 8, "rd": 130298.13, "admin": 145530.06, "mkt": 323876.68, "state": "Florida", "profit": 155752.6},
    {"id": 9, "rd": 120542.52, "admin": 148718.95, "mkt": 311613.29, "state": "New York", "profit": 152211.77},
    {"id": 10, "rd": 123334.88, "admin": 108679.17, "mkt": 304981.62, "state": "California", "profit": 149759.96},
    {"id": 11, "rd": 101913.08, "admin": 110594.11, "mkt": 229160.95, "state": "Florida", "profit": 146121.95},
    {"id": 12, "rd": 100671.96, "admin": 91790.61, "mkt": 249744.55, "state": "California", "profit": 144259.4},
    {"id": 13, "rd": 93863.75, "admin": 127320.38, "mkt": 249839.44, "state": "Florida", "profit": 141585.52},
    {"id": 14, "rd": 91992.39, "admin": 135495.07, "mkt": 252664.93, "state": "California", "profit": 134307.35},
    {"id": 15, "rd": 119943.24, "admin": 156547.42, "mkt": 256512.92, "state": "Florida", "profit": 132602.65},
    {"id": 16, "rd": 114523.61, "admin": 122616.84, "mkt": 261776.23, "state": "New York", "profit": 129917.04},
    {"id": 17, "rd": 78013.11, "admin": 121597.55, "mkt": 264346.06, "state": "California", "profit": 126992.93},
    {"id": 18, "rd": 94657.16, "admin": 145077.58, "mkt": 282574.31, "state": "New York", "profit": 125370.37},
    {"id": 19, "rd": 91749.16, "admin": 114175.79, "mkt": 294919.57, "state": "Florida", "profit": 124266.9},
    {"id": 20, "rd": 86419.7, "admin": 153514.11, "mkt": 0.0, "state": "New York", "profit": 122776.86},
    {"id": 21, "rd": 76253.86, "admin": 113867.3, "mkt": 298664.47, "state": "California", "profit": 118474.03},
    {"id": 22, "rd": 78389.47, "admin": 153773.43, "mkt": 299737.29, "state": "New York", "profit": 111313.02},
    {"id": 23, "rd": 73994.56, "admin": 122782.75, "mkt": 303319.26, "state": "Florida", "profit": 110352.25},
    {"id": 24, "rd": 67532.53, "admin": 105751.03, "mkt": 304768.73, "state": "Florida", "profit": 108733.99},
    {"id": 25, "rd": 77044.01, "admin": 99281.34, "mkt": 140574.81, "state": "New York", "profit": 108552.04},
    {"id": 26, "rd": 64664.71, "admin": 139553.16, "mkt": 137962.62, "state": "California", "profit": 107404.34},
    {"id": 27, "rd": 75328.87, "admin": 144135.98, "mkt": 134050.07, "state": "Florida", "profit": 105733.54},
    {"id": 28, "rd": 72107.6, "admin": 127864.55, "mkt": 353183.81, "state": "New York", "profit": 105008.31},
    {"id": 29, "rd": 66051.52, "admin": 182645.56, "mkt": 118148.2, "state": "Florida", "profit": 103282.38},
    {"id": 30, "rd": 65605.48, "admin": 153032.06, "mkt": 107138.38, "state": "New York", "profit": 101004.64},
    {"id": 31, "rd": 61994.48, "admin": 115641.28, "mkt": 91131.24, "state": "Florida", "profit": 99937.59},
    {"id": 32, "rd": 61136.38, "admin": 152701.92, "mkt": 88218.23, "state": "New York", "profit": 97483.56},
    {"id": 33, "rd": 63408.86, "admin": 129219.61, "mkt": 46085.25, "state": "California", "profit": 97427.84},
    {"id": 34, "rd": 55493.95, "admin": 103057.49, "mkt": 214634.81, "state": "Florida", "profit": 96778.92},
    {"id": 35, "rd": 46426.07, "admin": 157693.92, "mkt": 210797.67, "state": "California", "profit": 96712.8},
    {"id": 36, "rd": 46014.02, "admin": 85047.44, "mkt": 205517.64, "state": "New York", "profit": 96479.51},
    {"id": 37, "rd": 28663.76, "admin": 127056.21, "mkt": 201126.82, "state": "Florida", "profit": 90708.19},
    {"id": 38, "rd": 44069.95, "admin": 51283.14, "mkt": 197029.42, "state": "California", "profit": 89949.14},
    {"id": 39, "rd": 20229.59, "admin": 65947.93, "mkt": 185265.1, "state": "New York", "profit": 81229.06},
    {"id": 40, "rd": 38558.51, "admin": 82982.09, "mkt": 174999.3, "state": "California", "profit": 81005.76},
    {"id": 41, "rd": 28754.33, "admin": 118546.05, "mkt": 172795.67, "state": "California", "profit": 78239.91},
    {"id": 42, "rd": 27892.92, "admin": 84710.77, "mkt": 164470.71, "state": "Florida", "profit": 77798.83},
    {"id": 43, "rd": 23640.93, "admin": 96189.63, "mkt": 148001.11, "state": "California", "profit": 71498.49},
    {"id": 44, "rd": 15505.73, "admin": 127382.3, "mkt": 35534.17, "state": "New York", "profit": 69758.98},
    {"id": 45, "rd": 22177.74, "admin": 154806.14, "mkt": 28334.72, "state": "California", "profit": 65200.33},
    {"id": 46, "rd": 1000.23, "admin": 124153.04, "mkt": 1903.93, "state": "New York", "profit": 64926.08},
    {"id": 47, "rd": 1315.46, "admin": 115816.21, "mkt": 297114.46, "state": "Florida", "profit": 49490.75},
    {"id": 48, "rd": 0.0, "admin": 135426.92, "mkt": 0.0, "state": "California", "profit": 42559.73},
    {"id": 49, "rd": 542.05, "admin": 51743.15, "mkt": 0.0, "state": "New York", "profit": 35673.41},
    {"id": 50, "rd": 0.0, "admin": 116983.8, "mkt": 45173.06, "state": "California", "profit": 14681.4}
  ]
};
