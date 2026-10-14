# ============================================================
# CRISP-DM: 50 STARTUPS - 5 FEATURE SELECTION METHODS COMPARISON
# Multiple Linear Regression across Number of Features (k=1..5)
# ============================================================

import itertools
import warnings
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, LassoCV
from sklearn.feature_selection import mutual_info_regression
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler

warnings.filterwarnings("ignore")

# ============================================================
# 1. BUSINESS UNDERSTANDING
# Objective: Predict startup Profit & compare 5 feature selection
#            methods across different feature counts (k=1..5).
# ============================================================

# ============================================================
# 2. DATA UNDERSTANDING
# ============================================================
df = pd.read_csv("50_Startups.csv")

print("Dataset Shape:", df.shape)
print(df.head())

# Clean column names & drop duplicates / missing
df.columns = df.columns.str.strip()
df = df.drop_duplicates().dropna()

# ============================================================
# 3. DATA PREPARATION
# ============================================================
# One-hot encode State (drop_first=True to avoid dummy variable trap -> 5 features)
X = pd.get_dummies(df.drop("Profit", axis=1), drop_first=True)
y = df["Profit"]

feature_names = list(X.columns)
n_features = len(feature_names)

print(f"\nTotal Features ({n_features}): {feature_names}")

# Train/Test Split (random_state=0 matches reference benchmarks)
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.20,
    random_state=0
)

# ============================================================
# 4. FIVE FEATURE SELECTION METHODS ACROSS k = 1..5
# ============================================================
methods = {}

# --- Method 1: Forward Selection (Greedy Train RSS) ---
fwd_feats = {}
selected_fwd = []
candidates_fwd = list(feature_names)
for k in range(1, n_features + 1):
    best_feat = None
    best_tr_err = float("inf")
    for feat in candidates_fwd:
        sub = selected_fwd + [feat]
        lr = LinearRegression().fit(X_train[sub], y_train)
        err = mean_squared_error(y_train, lr.predict(X_train[sub]))
        if err < best_tr_err:
            best_tr_err = err
            best_feat = feat
    selected_fwd.append(best_feat)
    candidates_fwd.remove(best_feat)
    fwd_feats[k] = list(selected_fwd)
methods["Forward Selection"] = fwd_feats

# --- Method 2: Backward Elimination (Recursive Elimination) ---
bwd_feats = {}
current_bwd = list(feature_names)
for k in range(n_features, 0, -1):
    bwd_feats[k] = list(current_bwd)
    if k > 1:
        worst_feat = None
        best_sub_err = float("inf")
        for feat in current_bwd:
            sub = [col for col in current_bwd if col != feat]
            lr = LinearRegression().fit(X_train[sub], y_train)
            err = mean_squared_error(y_train, lr.predict(X_train[sub]))
            if err < best_sub_err:
                best_sub_err = err
                worst_feat = feat
        current_bwd.remove(worst_feat)
methods["Backward Elimination"] = bwd_feats

# --- Method 3: Lasso Regularization Ranking ---
scaler = StandardScaler()
X_tr_sc = scaler.fit_transform(X_train)
lasso_cv = LassoCV(cv=5, random_state=0).fit(X_tr_sc, y_train)
lasso_ranks = [feat for _, feat in sorted(
    zip(np.abs(lasso_cv.coef_), feature_names), reverse=True
)]
methods["Lasso Ranking"] = {
    k: lasso_ranks[:k] for k in range(1, n_features + 1)
}

# --- Method 4: Mutual Information Ranking ---
mi_scores = mutual_info_regression(X_train, y_train, random_state=0)
mi_ranked = [feat for _, feat in sorted(
    zip(mi_scores, feature_names), reverse=True
)]
methods["Mutual Information"] = {
    k: mi_ranked[:k] for k in range(1, n_features + 1)
}

# --- Method 5: Best Subset Selection (Exhaustive Search) ---
best_sub_feats = {}
for k in range(1, n_features + 1):
    best_combo = None
    best_err = float("inf")
    for combo in itertools.combinations(feature_names, k):
        lr = LinearRegression().fit(X_train[list(combo)], y_train)
        err = mean_squared_error(y_train, lr.predict(X_train[list(combo)]))
        if err < best_err:
            best_err = err
            best_combo = list(combo)
    best_sub_feats[k] = best_combo
methods["Best Subset (Exhaustive)"] = best_sub_feats

# ============================================================
# 5. EVALUATION: MODEL EVALUATION & COMPARISON TABLE
# ============================================================
records = []
for m_name, k_dict in methods.items():
    for k, feats in k_dict.items():
        lr = LinearRegression().fit(X_train[feats], y_train)
        preds = lr.predict(X_test[feats])
        rmse = np.sqrt(mean_squared_error(y_test, preds))
        r2 = r2_score(y_test, preds)
        mae = mean_squared_error(y_test, preds)
        records.append({
            "Method": m_name,
            "Number of Features (k)": k,
            "RMSE": rmse,
            "R-squared": r2,
            "Selected Features": ", ".join(feats)
        })

results_df = pd.DataFrame(records)

print("\n" + "=" * 90)
print("FEATURE SELECTION: 5 METHODS ACROSS FEATURE COUNTS (k = 1..5)")
print("=" * 90)
pd.set_option("display.max_columns", None)
pd.set_option("display.width", 1000)
print(
    results_df.to_string(
        index=False,
        formatters={
            "RMSE": "{:,.2f}".format,
            "R-squared": "{:.4f}".format
        }
    )
)

# ============================================================
# 6. VISUALIZATION: DUAL PLOTS WITH 5 LINES
# ============================================================
fig, axes = plt.subplots(1, 2, figsize=(15, 6))

style_map = {
    "Forward Selection": {
        "color": "#1f77b4", "marker": "o", "linestyle": "-", "linewidth": 2.2
    },
    "Backward Elimination": {
        "color": "#ff7f0e", "marker": "s", "linestyle": "--", "linewidth": 2.0
    },
    "Lasso Ranking": {
        "color": "#2ca02c", "marker": "^", "linestyle": "-.", "linewidth": 2.0
    },
    "Mutual Information": {
        "color": "#d62728", "marker": "D", "linestyle": ":", "linewidth": 2.2
    },
    "Best Subset (Exhaustive)": {
        "color": "#9467bd", "marker": "v", "linestyle": "-", "linewidth": 1.8
    }
}

for m_name, group in results_df.groupby("Method", sort=False):
    st = style_map[m_name]
    axes[0].plot(
        group["Number of Features (k)"],
        group["RMSE"],
        label=m_name,
        **st,
        markersize=7
    )
    axes[1].plot(
        group["Number of Features (k)"],
        group["R-squared"],
        label=m_name,
        **st,
        markersize=7
    )

# Subplot 1: RMSE by Number of Features
axes[0].set_title(
    "RMSE by Number of Features (5 Methods)",
    fontsize=13,
    fontweight="bold"
)
axes[0].set_xlabel("Number of Features (k)", fontsize=11)
axes[0].set_ylabel("RMSE (Lower is Better)", fontsize=11)
axes[0].set_xticks(range(1, n_features + 1))
axes[0].grid(True, linestyle="--", alpha=0.6)
axes[0].legend(fontsize=9, loc="upper left")

# Subplot 2: R-squared by Number of Features
axes[1].set_title(
    "R-squared by Number of Features (5 Methods)",
    fontsize=13,
    fontweight="bold"
)
axes[1].set_xlabel("Number of Features (k)", fontsize=11)
axes[1].set_ylabel("R-squared (Higher is Better)", fontsize=11)
axes[1].set_xticks(range(1, n_features + 1))
axes[1].grid(True, linestyle="--", alpha=0.6)
axes[1].legend(fontsize=9, loc="lower left")

plt.suptitle(
    "50 Startups: Comparison of 5 Feature Selection Methods Across Feature Counts",
    fontsize=15,
    fontweight="bold",
    y=1.02
)
plt.tight_layout()
plt.savefig("five_methods_comparison.png", dpi=300, bbox_inches="tight")
plt.show()

# ============================================================
# 7. DEPLOYMENT (Using the Winning Feature Subset)
# ============================================================
best_row = results_df.sort_values("RMSE").iloc[0]
best_method = best_row["Method"]
best_k = best_row["Number of Features (k)"]
best_feats_str = best_row["Selected Features"]
best_feats = [f.strip() for f in best_feats_str.split(",")]
best_rmse = best_row["RMSE"]
best_r2 = best_row["R-squared"]

print("\n" + "=" * 90)
print("OPTIMAL MODEL & DEPLOYMENT PREDICTION")
print("=" * 90)
print(f"Overall Best Method  : {best_method}")
print(f"Optimal Feature Count: {best_k}")
print(f"Selected Features    : {best_feats}")
print(f"Best Test RMSE       : {best_rmse:,.2f}")
print(f"Best Test R-squared  : {best_r2:.4f}")

# Train final deployment model
final_model = LinearRegression()
final_model.fit(X_train[best_feats], y_train)

# Example new startup prediction
new_startup = pd.DataFrame([{
    "R&D Spend": 100000,
    "Administration": 120000,
    "Marketing Spend": 200000,
    "State": "California"
}])
new_encoded = pd.get_dummies(new_startup)
for col in best_feats:
    if col not in new_encoded.columns:
        new_encoded[col] = 0

pred_profit = final_model.predict(new_encoded[best_feats])
print(f"Predicted Profit for New Startup: ${pred_profit[0]:,.2f}")