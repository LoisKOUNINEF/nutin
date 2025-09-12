# Security Policy

## Reporting Security Vulnerabilities

We take the security of our project seriously. If you believe you have found a security vulnerability, please report it responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by emailing us at:

📧 **nutin.toolkit@gmail.com**

You should receive a response within a week. If for some reason you do not, please follow up via email to ensure we received your original message.

### What to Include

Please include as much of the information listed below as you can to help us better understand and resolve the issue:

- **Type of issue** (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- **Full paths of source file(s)** related to the manifestation of the issue
- **Location of the affected source code** (tag/branch/commit or direct URL)
- **Special configuration** required to reproduce the issue
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact of the issue**, including how an attacker might exploit the issue

This information will help us triage your report more quickly.

## Supported Versions

We only support the latest version.

## Security Update Process

### Our Commitment

- We will respond to security reports within **a week**
- We will provide regular updates on our progress
- We will work with you to understand and resolve the issue
- We will coordinate disclosure with you

### Timeline

1. **Initial Response**: Within a week
2. **Investigation**: 1-7 days for initial assessment
3. **Fix Development**: Timeline depends on complexity
4. **Testing & Review**: 1-7 days
5. **Release**: Coordinated with reporter
6. **Public Disclosure**: After fix is available

## Security Best Practices

### For Users

#### Package Usage

- **Keep dependencies updated**: Regularly update to the latest version
- **Use npm audit**: Run `npm audit` regularly to check for vulnerabilities
- **Pin versions**: Use exact versions in production environments
- **Review dependencies**: Understand what packages you're including
- **XSS Test Cases :**

Basic script injection :                                
`"><script>alert('XSS')</script>`                            

Image onerror :                               
`"><img src=x onerror=alert('XSS')>`                               

SVG injection :                               
`"><svg onload=alert('XSS')>`                               

Template literal escape (if using backticks) :                               
`${alert('XSS')}`                               

Event handler attributes:                               
`" onmouseover="alert('XSS')"`


#### Environment Security

- **Secure API keys**: Never commit API keys or secrets to version control
- **Use environment variables**: Store sensitive configuration in environment variables
- **Validate inputs**: Always validate and sanitize user inputs
- **Use HTTPS**: Ensure all communications use HTTPS in production

### For Contributors

#### Development

- **Dependency management**: Be cautious when adding new dependencies. nutin doesn't natively use any runtime dependencies.
- **Input validation**: Always validate and sanitize inputs
- **Error handling**: Don't expose sensitive information in error messages

## Vulnerability Disclosure Policy

### Public Disclosure

After a security issue has been resolved:

1. **Security advisory** published on GitHub
2. **Release notes** include security fix information
3. **CVE assignment** requested if applicable
4. **Community notification** through appropriate channels

## Security Contact Information

### Primary Contact
- **Email**: nutin-toolkit@gmail.com

### Response Languages
We can respond to security reports in:
- English
- French

## Security Hall of Fame

We would like to thank the following individuals for responsibly disclosing security vulnerabilities:

<!-- This section will be updated as we receive and address security reports -->

*No security vulnerabilities have been reported yet.*

## Legal

### Safe Harbor

We support safe harbor for security researchers who:

- Make a good faith effort to avoid privacy violations and disruptions
- Only interact with systems you own or have explicit permission to test
- Do not access or modify user data
- Report vulnerabilities promptly
- Do not perform attacks that could harm our users or services

### Disclaimer

This security policy does not grant any rights or permissions beyond those explicitly stated. All testing and research should comply with applicable laws and regulations.

## Additional Resources

### Security Learning Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [npm Security Best Practices](https://docs.npmjs.com/security)

### Security Tools

- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Snyk](https://snyk.io/)
- [OWASP ZAP](https://owasp.org/www-project-zap/)

---

**Version**: 1.0.0  
**Last Updated**: 09/09/2025  

Thank you for helping keep our project and users safe! 🔒