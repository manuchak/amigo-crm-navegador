
# Authentication Refactoring Plan

This document outlines the steps needed to resolve the current authentication issues in the application where multiple auth context implementations are causing conflicts.

## Current Issues

- Duplicate auth context implementations in:
  - `src/context/AuthContext.tsx` (376 lines)
  - `src/context/auth/AuthContext.tsx` (377 lines)
- Circular dependencies between auth files
- Inconsistent import paths across components
- Components failing to load due to auth state not being ready
- Extremely long, monolithic auth context files

## Refactoring Steps

### 1. Fix Authentication Context Structure

- [ ] Delete `src/context/AuthContext.ts` (creates circular dependencies)
- [ ] Update `src/context/auth/index.ts` to be the single source of truth
- [ ] Ensure all auth-related exports come from `src/context/auth`
- [ ] Remove any redundant implementations

### 2. Update Import References

- [ ] Find all instances of incorrect auth imports:
  - `import { useAuth } from '@/context/AuthContext'`
  - `import { useAuth } from '@/context/auth/AuthContext'`
- [ ] Replace with the standardized path:
  - `import { useAuth } from '@/context/auth'`
- [ ] Check for any other inconsistent import paths

### 3. Fix App.tsx

- [ ] Change dynamically imported components that depend on auth to static imports
- [ ] Ensure Leads page is imported statically to avoid auth timing issues
- [ ] Verify that the AuthProvider properly wraps all routes

### 4. Improve Auth Provider Implementation

- [ ] Add clear loading states to prevent rendering before auth is ready
- [ ] Ensure proper initialization sequence in the auth provider
- [ ] Fix the order of operations in the auth effect hook
- [ ] Add error boundaries around auth-dependent components

### 5. Add Debug Logging

- [ ] Add strategic logging points to track auth state transitions
- [ ] Log component mounts with their current auth state
- [ ] Add timing information to auth operations

### 6. Refactor Auth Context into Smaller Modules

- [ ] Split the 376-line context files into smaller, focused files
- [ ] Create separate files for:
  - Authentication (login/logout)
  - User management
  - Role management
  - Session handling
- [ ] Use composition to rebuild the complete auth context

### 7. Testing Plan

- [ ] Test authentication flow (login/logout)
- [ ] Verify protected routes work correctly
- [ ] Test navigation between pages
- [ ] Verify that the Leads page loads without errors
- [ ] Check that auth state is consistently available to components

### 8. Code Quality Improvements

- [ ] Add comments explaining the auth flow
- [ ] Add better TypeScript typing for auth states
- [ ] Remove any dead code
- [ ] Optimize auth state updates to minimize rerenders

## Implementation Priority

1. Fix the immediate issue: fix imports and ensure one auth implementation
2. Update App.tsx to use static imports for auth-dependent components
3. Add thorough debugging to track auth state
4. Gradually refactor the auth context into smaller modules
5. Implement testing for all auth flows

## Considerations for Future Maintenance

- Keep auth-related files small and focused
- Maintain clear separation between auth state and auth functionality
- Document the authentication flow for new developers
- Consider adding unit tests for authentication flow
