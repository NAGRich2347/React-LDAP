# Workflow Fix Summary: Final Reviewer Access Control

## Issue
The Final Reviewer was able to see Stage 1 documents (initial student submissions) in addition to Stage 2 documents (documents sent from librarians). This violated the intended workflow where Final Reviewers should only review Stage 2 documents that have been processed by librarians.

## Solution
Updated the filtering logic in both the `Reviewer.js` and `Librarian.js` components to properly filter submissions based on the active tab and user role.

## Changes Made

### 1. Reviewer.js Component (`client/src/components/Reviewer.js`)

**Updated filtering logic in the `useEffect` hook:**

```javascript
// Filter by active tab - Final Reviewer should only see Stage 2 documents
if (activeTab === 'to-review') {
  // Only show Stage 2 documents that haven't been returned from review
  data = data.filter(s => s.stage === 'Stage2' && !s.returnedFromReview);
} else if (activeTab === 'returned') {
  // Only show Stage 2 documents that have been returned from review
  data = data.filter(s => s.stage === 'Stage2' && s.returnedFromReview);
} else if (activeTab === 'sent') {
  // Show Stage 3 documents (approved/published) by this reviewer
  data = data.filter(s => s.stage === 'Stage3' && s.filename.includes(user));
} else if (activeTab === 'sent-back') {
  // Show Stage 1 documents that this reviewer sent back to students
  data = data.filter(s => s.stage === 'Stage1' && s.sentBackBy === user);
}
```

**Key Changes:**
- Added `activeTab` dependency to the `useEffect` hook
- Implemented stage-based filtering for each tab
- Ensured Final Reviewers can only see Stage 2 documents in the main review tabs
- Maintained access to Stage 1 documents only in the "sent-back" tab (documents they returned to students)

### 2. Librarian.js Component (`client/src/components/Librarian.js`)

**Updated filtering logic to be consistent:**

```javascript
// Filter by active tab - Librarian can see Stage 1 and Stage 2 documents
if (activeTab === 'to-review') {
  // Show Stage 1 documents (initial submissions) and Stage 2 documents that haven't been sent to reviewer
  data = data.filter(s => (s.stage === 'Stage1' && !s.returnedFromReview) || (s.stage === 'Stage2' && !s.sentToReviewer));
} else if (activeTab === 'returned') {
  // Show Stage 2 documents that have been returned from reviewer
  data = data.filter(s => s.stage === 'Stage2' && s.returnedFromReview);
} else if (activeTab === 'sent') {
  // Show Stage 2 documents that have been sent to reviewer by this librarian
  data = data.filter(s => s.stage === 'Stage2' && s.sentToReviewer && s.sentBy === user);
} else if (activeTab === 'sent-back') {
  // Show Stage 1 documents that have been sent back to students by this librarian
  data = data.filter(s => s.stage === 'Stage1' && s.sentBackToStudent && s.sentBackBy === user);
}
```

**Key Changes:**
- Added `activeTab` dependency to the `useEffect` hook
- Implemented stage-based filtering for each tab
- Ensured Librarians can see both Stage 1 and Stage 2 documents as appropriate for their role

## Workflow Verification

### Final Reviewer Access:
- ✅ **To Review Tab**: Only Stage 2 documents (no Stage 1 documents)
- ✅ **Returned Tab**: Only Stage 2 documents that were returned from review
- ✅ **Sent Tab**: Only Stage 3 documents (approved/published) by this reviewer
- ✅ **Sent Back Tab**: Only Stage 1 documents that this reviewer sent back to students

### Librarian Access:
- ✅ **To Review Tab**: Stage 1 documents (initial submissions) and Stage 2 documents not yet sent to reviewer
- ✅ **Returned Tab**: Stage 2 documents returned from reviewer
- ✅ **Sent Tab**: Stage 2 documents sent to reviewer by this librarian
- ✅ **Sent Back Tab**: Stage 1 documents sent back to students by this librarian

## Testing
Created and ran a test script that verified:
- Stage 1 documents are properly excluded from Final Reviewer's "to-review" tab
- Stage 2 documents are correctly shown in appropriate tabs
- Filtering logic works correctly for all tab combinations
- No unintended access to documents outside the user's role

## Result
The Final Reviewer now has proper access control and can only see Stage 2 documents that they are supposed to review, while maintaining access to their own submission history and documents they've sent back to students.

## Files Modified
1. `client/src/components/Reviewer.js` - Updated filtering logic for Final Reviewer
2. `client/src/components/Librarian.js` - Updated filtering logic for consistency

## Impact
- **Security**: Improved access control prevents Final Reviewers from seeing Stage 1 documents
- **Workflow**: Maintains proper document flow through the review process
- **User Experience**: Clear separation of documents by stage and role
- **Consistency**: Both Reviewer and Librarian components now use consistent filtering logic 