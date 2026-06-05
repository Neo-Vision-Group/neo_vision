# Security Deployment Checklist

## Pre-Deployment

### Environment Variables

- [ ] Set `POSTHOG_SERVER_API_KEY` (separate from client token)
- [ ] Set `NEXT_PUBLIC_SITE_URL` to production domain
- [ ] Verify `NODE_ENV=production`
- [ ] Confirm no `localhost` in allowed origins
- [ ] Set `RESEND_API_KEY` for email notifications
- [ ] Set `RESEND_FROM` and `CONTACT_TO` emails
- [ ] Validate all required Sanity environment variables

### Security Configuration

- [ ] Run environment validation: `validateEnv()` passes
- [ ] Verify CSRF token generation works
- [ ] Test rate limiting locally
- [ ] Confirm security headers are applied
- [ ] Check CSP policy doesn't block required resources
- [ ] Verify cookie security flags (Secure, SameSite=Strict)

### Code Review

- [ ] All user inputs are sanitized
- [ ] Error messages don't leak sensitive information
- [ ] No hardcoded secrets or API keys
- [ ] CORS origins are environment-driven
- [ ] PostHog distinct ID uses server-generated hash
- [ ] Security logging is enabled

## Deployment

### DNS & SSL

- [ ] SSL certificate is valid and up-to-date
- [ ] HTTPS is enforced (no HTTP access)
- [ ] DNS records are correct
- [ ] CDN/proxy is configured (if using)

### Security Headers

Test with: https://securityheaders.com

- [ ] Content-Security-Policy is active
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Strict-Transport-Security (without preload initially)
- [ ] Referrer-Policy
- [ ] Permissions-Policy

### API Endpoints

- [ ] `/api/contact` returns 429 after rate limit
- [ ] `/api/contact` requires CSRF token
- [ ] `/api/contact` validates Origin and Referer
- [ ] `/api/csrf` generates valid tokens
- [ ] `/.well-known/security.txt` is accessible

### Testing

- [ ] Submit contact form successfully
- [ ] Trigger rate limit (6+ submissions in 15 min)
- [ ] Test CSRF protection (submit without token)
- [ ] Verify security logging works
- [ ] Check PostHog events are tracked
- [ ] Test email notifications

## Post-Deployment

### Monitoring (First 24 Hours)

- [ ] Monitor security logs for anomalies
- [ ] Check rate limit triggers
- [ ] Verify no CSP violations in browser console
- [ ] Confirm email notifications are received
- [ ] Test contact form from production domain

### Security Validation

- [ ] Run: `npm audit` (no critical vulnerabilities)
- [ ] Test with OWASP ZAP or similar scanner
- [ ] Verify security.txt is accessible
- [ ] Check SSL Labs rating: https://www.ssllabs.com/ssltest/
- [ ] Validate headers: https://securityheaders.com

### Documentation

- [ ] Update team on new security features
- [ ] Document incident response procedures
- [ ] Share security contact email
- [ ] Update README with security notes

## Weekly Maintenance

- [ ] Review security logs
- [ ] Check for unusual rate limit patterns
- [ ] Monitor failed CSRF validations
- [ ] Review PostHog analytics for anomalies

## Monthly Maintenance

- [ ] Run `npm audit` and update dependencies
- [ ] Review and rotate API keys (if needed)
- [ ] Test security headers
- [ ] Check SSL certificate expiration
- [ ] Review security.txt expiration date

## Quarterly Maintenance

- [ ] External security audit
- [ ] Penetration testing
- [ ] Review and update security policies
- [ ] Update SECURITY.md documentation

## HSTS Preload (Future)

Only enable when ready for permanent HTTPS:

1. [ ] Test HSTS header for 1 week
2. [ ] Verify all subdomains support HTTPS
3. [ ] Submit to: https://hstspreload.org
4. [ ] Add `preload` to HSTS header after approval
5. [ ] Update `next.config.ts` with preload flag

## Incident Response

If security issue detected:

1. **Immediate Actions**
   - [ ] Review security logs with correlation IDs
   - [ ] Identify affected endpoints/users
   - [ ] Block malicious IPs if needed
   
2. **Investigation**
   - [ ] Trace requests using correlation IDs
   - [ ] Check for data breaches
   - [ ] Document timeline and impact
   
3. **Remediation**
   - [ ] Patch vulnerabilities
   - [ ] Rotate compromised credentials
   - [ ] Deploy fixes
   
4. **Communication**
   - [ ] Notify affected users (if applicable)
   - [ ] Update security documentation
   - [ ] Share lessons learned with team

## Production-Only Checks

- [ ] Localhost is NOT in allowed origins
- [ ] Console logging is minimal (errors only)
- [ ] Source maps are disabled or protected
- [ ] Debug mode is disabled
- [ ] Rate limiting is active
- [ ] CSRF protection is enforced

## Rollback Plan

If security issues arise post-deployment:

1. [ ] Revert to previous stable version
2. [ ] Review security logs for root cause
3. [ ] Fix issues in staging environment
4. [ ] Re-test security measures
5. [ ] Re-deploy with fixes

## Contact Information

- **Security Issues:** security@neovision.dev
- **General Support:** office@neovision.dev
- **On-Call:** [Add on-call contact]

## Sign-Off

- [ ] Security review completed by: ________________
- [ ] Deployment approved by: ________________
- [ ] Date: ________________

---

**Note:** This checklist should be completed for every production deployment.
