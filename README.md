# SplitSmart

A responsive React/Vite expense splitter with a paper-and-lime visual identity. Includes groups and members, editable expenses, equal/percentage/exact/weighted/item-wise splits, integer-cent accounting, greedy debt simplification, interactive settlement graph, recorded payments and undo, budgets, category/person/day analytics, receipt image attachment and manual item correction, demo data, search, JSON backup/restore, and local persistence.

## Run in VS Code

Expenses now support multiple payers. Toggle **Multiple people paid** and enter the amount each person contributed; the contributions must exactly match the bill. Contributions are independent of consumption shares and feed balances, debt simplification and per-member paid totals. This works for every split mode and Fair Upgrade conversion. Old single-payer expenses and backups still work; editing them saves the new contribution format.

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. To verify:

```sh
npm test
npm run build
npm run preview
```

## Deploy to Vercel

1. Push this directory to your intended GitHub repository.
2. In Vercel, choose **Add New → Project** and import that repository.
3. Set the root directory to this app's directory if your repository has other projects. Framework: **Vite**, build: `npm run build`, output: `dist`.
4. Deploy. `vercel.json` already includes the build settings and SPA rewrite. No environment variables required.

Alternatively run `npx vercel` from this folder and follow the account/project prompts; use `npx vercel --prod` for production.

## Demo walkthrough

- The first visit loads a four-person Goa group. Add a group or load more demo data from the footer.
- Add an expense and try each split mode. Percentage totals must equal 100; exact shares and receipt item totals must equal the expense amount.
- For a receipt, choose Item-wise, attach an image, add/correct items, and assign members. Use item total to populate the expense amount. Receipt input is manual; automatic OCR is not included.
- Click an expense to edit it. Balances, budget and analytics recalculate immediately.
- Open Settle up. Click a person to highlight their graph edges, or click an amount to record a settlement. Payments can be partial. Undo recorded payments from history.
- Rename/add members from Manage crew. Removing a member referenced in transactions is blocked. Delete those transactions first.
- Export a backup to move data between devices. Import replaces your data after confirmation.

## Persistence and boundaries

## Fair Upgrade

Open **Fair Upgrade** to protect an agreed baseline while comparing pricier options. Enter the baseline and alternative costs, then record each member's upgrade opt-in, maximum total, or voluntary extra sponsorship. Limits alone never authorize extra charges. An explicit sponsorship works even when the maximum is blank: its implicit maximum is baseline plus the offered extra. An explicitly entered maximum always caps contributions. Upgrade opt-in alone still needs a maximum above baseline. The engine splits the baseline equally and distributes upgrade costs evenly among volunteers subject to their contribution limits, redistributing any remaining amount to volunteers with capacity. An unfunded plan cannot become an expense.

The comparison shows each person's baseline, extra contribution, final share and an equal-split comparison. Every member must confirm their final share before conversion; changes to the plan, payer details or crew invalidate these confirmations. Draft proposals, payer entries and shared-device confirmations persist locally across tab switches and reload. Conversion clears the draft and resets the planner to prevent accidental repeat submissions. Conversion creates a regular editable exact-split expense with the agreement breakdown attached, which feeds existing balances and analytics. This is a shared-device prototype: confirmations are entered on this device, not authenticated remote approvals. Maximum contributions are visible on this shared device.

Example: baseline 4,000, option 7,000, four people. Two upgrade volunteers with maximum totals of 2,500 each pay 2,500 each; the other two keep their original 1,000 shares. Drag the what-if slider to see funding and shares respond. Offers and limits are capacities, not automatic charges. Record only completed purchases as expenses.

Data is saved in this browser's localStorage. There is no server account, authentication or multi-device sync. A deployed URL hosts the app; each browser keeps independent data. Export backups before clearing browser storage. Currency is selected per group and locked once transactions exist; no FX conversion is performed. Receipts are limited to 1.5 MB each to reduce storage pressure. Payments are accounting entries and do not send money. Greedy simplification reduces payment edges but does not guarantee the mathematical minimum in every case.

## Project

- `src/engine.js`: pure cent-based allocation, balances, simplification and demo data.
- `src/main.jsx`: complete application and forms.
- `src/style.css`: responsive visual system.
- `tests/engine.test.js`: financial invariants and invalid input coverage.

For a production collaboration product, add authenticated server storage and real receipt OCR before advertising these capabilities.
