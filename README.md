💸 Expense Tracker

I don't trust apps that make budgeting feel like a punishment. Most finance apps guilt-trip you with red numbers and passive-aggressive push notifications like they're your ex. This one just tells you the truth: here's what you spent, here's what's left, deal with it.

I built this because I wanted a React Native project that actually does something, not another to-do list clone. So I gave it real logic — budgets that warn you before you're broke, a chart you can tap to filter your own life, and a "Clear All" button for when you just want to pretend today never happened.

What it actually does
Add, edit, delete, and search expenses — with categories, dates, and a running total that doesn't lie to you
Custom categories. "Food, Transport, Data, Other" is not a personality. Add your own.
Set a monthly budget per category, watch a progress bar fill up, and get warned before you exceed it — not after
Track income separately and see your real balance: income minus expenses, no sugarcoating
A "Spending by Category" chart you can literally tap to instantly filter your transaction list
Everything survives closing the app — real persistence via AsyncStorage, not a demo that resets the second you blink
Export your entire data set to clipboard as JSON, because sometimes you want receipts (pun intended)
Quick-add preset amounts for the stuff you buy on autopilot
A toast notification for every action, because silent apps feel broken even when they aren't
The honest part

This is a portfolio project, not a finished product, and I'd rather say that upfront than have you find out. There's no login, no cloud sync, no bank integration — everything lives on your device. If you uninstall the app, your data goes with it. That's a deliberate scope decision, not an oversight: I built the actual logic first — the part that's hard to fake — instead of bolting on auth just to look "complete."

Built with
React Native + Expo (Expo Router)
TypeScript
AsyncStorage for persistence
expo-clipboard for data export
Zero UI libraries — every button, pill, and progress bar is hand-styled
Running it yourself
bash
git clone https://github.com/ayomideomosaiye-cyber/expense-tracker.git
cd expense-tracker
npm install
npm run web

(Or npx expo start and scan the QR with Expo Go if you want it on your phone instead of a browser.)

What's next, if I keep going
Custom category colors/icons instead of an auto-assigned palette
Recurring expenses (rent, subscriptions — the stuff that never stops)
A real backend, if this ever needs to leave "my device only"
Flutterwave sandbox integration, because Naira-first fintech should be the default, not an afterthought
Why this exists at all

I'm learning React Native by building things that actually push back when I get them wrong — not tutorials I copy without understanding. Every feature here broke at least once before it worked, and I'd rather show you the working version than pretend it arrived that way.
