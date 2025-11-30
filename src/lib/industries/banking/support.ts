// src/lib/industries/banking/support.ts

/**
 * Banking module - ATM and Online Banking support
 */

export type ATMIssue =
    | 'card_stuck'
    | 'cash_not_dispensed'
    | 'wrong_amount'
    | 'cant_withdraw'
    | 'receipt_issue'
    | 'atm_error';

export type OnlineBankingIssue =
    | 'cant_login'
    | 'forgot_password'
    | 'account_locked'
    | 'transaction_failed'
    | 'slow_performance'
    | 'cant_register';

/**
 * Get ATM troubleshooting guide
 */
export function getATMTroubleshootingGuide(issue: ATMIssue): string {
    const guides: Record<ATMIssue, string> = {
        card_stuck: `🏧 Card Stuck in ATM - Immediate Actions

DON'T PANIC! Follow these steps:

1. DO NOT Leave the ATM
   • Stay at the machine
   • Don't accept help from strangers
   • Keep your PIN confidential

2. Note ATM Details
   • ATM ID (on machine)
   • Location address
   • Time of incident
   • Your account number

3. Call Customer Service IMMEDIATELY
   • Phone: 0800-XXXX-XXXX
   • Available 24/7
   • Report card stuck

4. What We'll Do
   • Block card immediately (prevent fraud)
   • Dispatch technician (within 2 hours)
   • Retrieve your card OR
   • Issue new card if damaged

5. Temporary Access
   • Use mobile app for transactions
   • Visit branch with ID for emergency card
   • Mobile money available

6. Prevention
   • Don't force card in/out
   • Wait for machine prompts
   • Ensure card not damaged
   • Insert card correct direction

Reference: ATM-STUCK-${Date.now()}`,

        cash_not_dispensed: `💵 Cash Not Dispensed - Resolution Steps

If ATM debited your account but didn't give cash:

1. Keep Your Receipt
   • Essential for claim
   • Shows transaction details
   • Proof of denied cash

2. DO NOT Try Again
   • Don't attempt another withdrawal
   • You may be charged twice
   • Wait for resolution

3. Take a Photo/Video
   • ATM screen (if showing error)
   • Receipt
   • ATM ID and location

4. Report Immediately
   • Call: 0800-XXXX-XXXX (24/7)
   • Or visit nearest branch
   • File a dispute claim

5. What Happens Next
   • Claim lodged immediately
   • ATM cash count verified (within 24h)
   • Provisional credit (within 48h)
   • Final resolution (3-5 days)

6. Track Your Claim
   • SMS updates sent
   • Check via mobile app
   • Call for status updates

7. Prevention
   • Use ATMs in well-lit areas
   • Check ATM for skimmers/tampering
   • Count cash before leaving
   • Keep receipts for 30 days

Claim Reference: CASH-${Date.now()}`,

        wrong_amount: `💸 Wrong Amount Dispensed - What To Do

If ATM gave incorrect amount:

1. DO NOT Leave ATM Area
   • Count cash immediately
   • Stay visible on camera
   • Don't pocket the money yet

2. Count Again Carefully
   • Check all notes
   • Verify against receipt
   • Note exact difference

3. Document Everything
   • Keep receipt
   • Photo of cash (if safe)
   • Note ATM details
   • Time and location

4. Report Immediately
   • If LESS than expected: Call us now
   • If MORE than expected: Call us too!
   • Phone: 0800-XXXX-XXXX

5. Less Money Received
   • File dispute claim
   • ATM audit conducted
   • Refund within 3-5 days

6. More Money Received
   • MUST be reported
   • Bank will collect excess
   • Avoid legal issues
   • Honesty appreciated

ATM audits are thorough - cameras verify all claims.`,

        cant_withdraw: `🚫 Can't Withdraw - Troubleshooting

If withdrawal is declined:

1. Check Your Balance First
   • Insufficient funds?
   • Check via mobile app
   • Or dial *123# (balance check)

2. Daily Limit Reached?
   • ATM Limit: K5,000/day
   • POS Limit: K10,000/day
   • Resets at midnight
   • Increase via app/branch

3. Card Issues
   • Expired card? Check date
   • Damaged chip/stripe?
   • Wrong PIN (3 attempts = lock)
   • Card blocked for security?

4. ATM-Specific Issues
   • Try different ATM
   • Network problems possible
   • ATM out of cash
   • Try our ATM network

5. Account Status
   • Account frozen?
   • Pending KYC update?
   • Court order?
   • Call us to verify

6. Quick Solutions
   • Use mobile app instead
   • Visit branch
   • Use debit card at POS
   • Try another ATM

Still stuck? Call: 0800-XXXX-XXXX`,

        receipt_issue: `📄 Receipt Problems - Solutions

Receipt Not Printing:

1. Check ATM Paper
   • ATM may be out of paper
   • Not your fault
   • Transaction still valid

2. Get Digital Receipt
   • Check mobile app
   • SMS notification
   • Email statement
   • Transaction history

3. For Disputes
   • Screenshot app transaction
   • Note: Date, time, amount
   • Reference number from SMS
   • ATM ID and location

4. Request Duplicate
   • Call customer service
   • Request email receipt
   • Free of charge
   • 1-hour delivery

Lost Receipt:
   • Not needed for most issues
   • All transactions tracked digitally
   • Access via mobile app
   • Monthly statement available`,

        atm_error: `⚠️ ATM Error Messages - Guide

Common ATM Errors:

Error: "UNABLE TO PROCESS"
→ Temporary network issue
→ Try again in 5 minutes
→ Use different ATM
→ Card not charged

Error: "TRANSACTION DECLINED"
→ Check balance
→ Verify card validity
→ Check daily limit
→ Contact customer service

Error: "INVALID CARD"
→ Card inserted wrong way
→ Damaged card chip
→ Expired card
→ Wrong card type (credit vs debit)

Error: "INSUFFICIENT FUNDS"
→ Balance too low
→ Include withdrawal fee
→ Check available balance
→ Pending transactions may reduce balance

Error: "INCORRECT PIN"
→ 3 attempts allowed
→ Careful entry
→ Block after 3 fails
→ Reset via mobile app or branch

Error: "CARD BLOCKED"
→ Security block
→ Too many wrong PINs
→ Suspected fraud
→ Call: 0800-XXXX-XXXX immediately

Error: "SERVICE NOT AVAILABLE"
→ ATM maintenance
→ Network down
→ Use different ATM
→ Check bank app for ATM status

General Tips:
• Use ATMs in bank premises when possible
• Avoid sketchy standalone ATMs
• Check for skimming devices
• Cover PIN when entering
• Take receipt or decline on screen
• Report issues immediately`,
    };

    return guides[issue];
}

/**
 * Get online banking support guide
 */
export function getOnlineBankingSupportGuide(issue: OnlineBankingIssue): string {
    const guides: Record<OnlineBankingIssue, string> = {
        cant_login: `🔐 Can't Login - Troubleshooting

Step 1: Verify Credentials
✓ Correct username/account number
✓ Correct password (case-sensitive)
✓ Check Caps Lock is OFF
✓ Username has no spaces

Step 2: Browser Issues
✓ Clear browser cache & cookies
✓ Try incognito/private mode
✓ Update browser to latest version
✓ Try different browser
✓ Disable VPN/proxy

Step 3: Account Status
✓ Account might be locked
✓ Too many failed attempts?
✓ Password expired (90 days)?
✓ First-time login?

Step 4: Quick Fixes
→ Use "Forgot Password" link
→ Reset via mobile app
→ Call customer service
→ Visit branch with ID

Step 5: Security Checks
✓ No suspicious SMS/emails?
✓ Verify you're on correct website
✓ URL: https://www.bankname.com
✓ Look for padlock icon

Need immediate access?
• Use mobile app instead
• Call us: 0800-XXXX-XXXX
• Visit nearest branch`,

        forgot_password: `🔑 Password Reset - Easy Steps

Online Reset (Fastest):

1. Click "Forgot Password"
   • On login page
   • Enter account number
   • Verify identity

2. Verification Options
   a) OTP via SMS
      • Sent to registered phone
      • Valid for 10 minutes
      • Enter 6-digit code
   
   b) Email Link
      • Sent to registered email
      • Click reset link
      • Valid for 30 minutes
   
   c) Security Questions
      • Answer 3 questions
      • Set during registration
      • Case-sensitive answers

3. Create New Password
   Requirements:
   • 8-16 characters
   • 1 uppercase letter
   • 1 lowercase letter
   • 1 number
   • 1 special character (!@#$%)
   • Not your name/account number
   • Different from last 5 passwords

4. Confirmation
   • New password active immediately
   • SMS confirmation sent
   • Login with new password

Alternative Methods:

Via Mobile App:
• Open app
• "Forgot Password"
• Biometric verification
• Set new password

Via Branch:
• Visit with National ID
• Instant reset
• No forms required

Via Phone:
• Call 0800-XXXX-XXXX
• Identity verification
• Temporary password issued
• Change on first login

Pro Tips:
💡 Use password manager
💡 Never share password
💡 Change every 90 days
💡 Don't use same password everywhere`,

        account_locked: `🔒 Account Locked - Unlock Guide

Why Locked?

1. Too Many Login Attempts
   • 5 failed attempts = 30 min lock
   • 10 failed attempts = 24 hour lock
   • Security protection

2. Suspicious Activity
   • Unusual login location
   • Multiple device logins
   • Large transactions
   • Fraud prevention

3. Security Update Required
   • KYC documentation expired
   • Contact details need update
   • Terms & conditions change

Unlock Methods:

Immediate Unlock:
→ Wait 30 minutes (for login attempts)
→ Call: 0800-XXXX-XXXX
→ Visit branch with ID
→ Use mobile app (may still work)

Via Phone (24/7):
1. Call customer service
2. Verify identity:
   • Account number
   • National ID
   • Recent transaction
   • Security questions
3. Immediate unlock
4. Reset password if needed

Via Branch:
• Bring National ID
• Instant unlock
• Update details if needed
• Get new password

Prevention:
✓ Remember login details
✓ Use password manager
✓ Keep contact details updated
✓ Enable biometric login
✓ Set up security alerts

Still Locked?
• May be fraud investigation
• Court order
• Account closure requested
• Contact us immediately`,

        transaction_failed: `❌ Transaction Failed - Solutions

Transaction Declined? Check:

1. Insufficient Balance
   • Including fees
   • Pending transactions
   • Check available balance
   • Not account balance

2. Daily Limits Exceeded
   • Transfer limit: K50,000/day
   • Bill payment: K20,000/day
   • Mobile money: K10,000/day
   • Increase limits in settings

3. Beneficiary Issues
   • Wrong account number?
   • Inactive account?
   • Bank code incorrect?
   • Verify details

4. Technical Issues
   • Network timeout
   • Server maintenance
   • Refresh page
   • Try again in 5 min

5. Security Blocks
   • Unusual transaction
   • New beneficiary
   • Large amount
   • Verify via OTP

What To Do:

✓ Check SMS notifications
✓ Verify transaction in history
✓ If debited but not received:
  • Wait 24 hours
  • File dispute if not reversed
  • Keep reference number

✓ Try Again:
  • Clear cache
  • Use mobile app
  • Different browser
  • Contact beneficiary to confirm

✓ Contact Us If:
  • Money deducted but failed
  • Repeated failures
  • Error message unclear
  • Urgent transaction

Call: 0800-XXXX-XXXX (24/7)`,

        slow_performance: `🐌 Slow Performance - Speed It Up

Quick Fixes:

1. Internet Connection
   ✓ Check WiFi/data strength
   ✓ Switch networks
   ✓ Restart router
   ✓ Use mobile data

2. Browser Optimization
   ✓ Clear cache & cookies
   ✓ Close other tabs
   ✓ Update browser
   ✓ Disable extensions
   ✓ Try Chrome/Firefox

3. Device Issues
   ✓ Close background apps
   ✓ Restart device
   ✓ Update OS
   ✓ Free up storage

4. Use Mobile App
   • Usually faster
   • Better optimized
   • Works offline (view)
   • Download from app store

5. Peak Hours
   • 8-10 AM: Busy
   • 12-2 PM: Busy
   • 5-7 PM: Busiest
   • Try off-peak times

6. Maintenance Mode
   • Check bank website
   • Scheduled maintenance
   • Usually 1-3 AM
   • SMS notification sent

Still Slow?
→ Report to tech support
→ Provide screenshots
→ Note: Browser & OS version
→ Describe exact issue`,

        cant_register: `📝 Can't Register - Step-by-Step Help

Registration Requirements:

1. Eligibility
   ✓ Existing account holder
   ✓ Valid account number
   ✓ Registered phone number
   ✓ Registered email
   ✓ National ID on file

2. Required Information
   • Account number
   • National ID number
   • Date of birth
   • Phone number (as registered)
   •Email (as registered)

3. Common Issues

"Account Not Found"
→ Verify account number (no spaces)
→ Check account type (savings/checking)
→ Account must be active
→ Visit branch to confirm details

"Phone Number Mismatch"
→ Use exact number on account
→ Include country code: +260
→ Update at branch if changed
→ Verify via SMS before registering

"Email Already Registered"
→ You may already have online banking
→ Try "Forgot Password"
→ Or call customer service
→ May have duplicate account

"OTP Not Received"
→ Check spam folder (email)
→ Verify phone number
→ Request resend (wait 2 min)
→ Network delays possible

4. Step-by-Step Registration

Visit: www.bankname.com
1. Click "Register for Online Banking"
2. Enter account number
3. Enter personal details
4. Create username (6-20 chars)
5. Create strong password
6. Set security questions (3)
7. Enter OTP (SMS + Email)
8. Accept terms & conditions
9. Login immediately

5. Need Help?

Visit Branch:
• Instant registration
• Bring National ID
• 5 minutes process
• Login credentials given

Call Us:
• 0800-XXXX-XXXX
• Guided registration
• Troubleshoot issues
• Verify account status

Mobile App Registration:
• Download app
• "New User Registration"
• Same process
• Faster & easier`,
    };

    return guides[issue];
}

/**
 * Get forex rates
 */
export async function getForexRates(): Promise<Array<{
    currency: string;
    buyRate: number;
    sellRate: number;
    lastUpdated: string;
}>> {
    // TODO: Integrate with forex API for real-time rates

    await new Promise((resolve) => setTimeout(resolve, 500));

    return [
        { currency: 'USD', buyRate: 25.50, sellRate: 26.20, lastUpdated: new Date().toISOString() },
        { currency: 'EUR', buyRate: 27.80, sellRate: 28.50, lastUpdated: new Date().toISOString() },
        { currency: 'GBP', buyRate: 32.10, sellRate: 32.90, lastUpdated: new Date().toISOString() },
        { currency: 'ZAR', buyRate: 1.35, sellRate: 1.45, lastUpdated: new Date().toISOString() },
    ];
}

/**
 * Format forex rates
 */
export function formatForexRates(rates: Awaited<ReturnType<typeof getForexRates>>): string {
    return `💱 Foreign Exchange Rates

${rates.map(r =>
        `${r.currency}/ZMW:
   Buy: K${r.buyRate.toFixed(2)}
   Sell: K${r.sellRate.toFixed(2)}`
    ).join('\n\n')}

Last Updated: ${new Date(rates[0].lastUpdated).toLocaleString()}

📝 Notes:
• Rates updated hourly
• Subject to market fluctuations
• Branch rates may vary slightly
• Better rates for large amounts

Need forex? Visit any branch or call 0800-XXXX-XXXX`;
}
