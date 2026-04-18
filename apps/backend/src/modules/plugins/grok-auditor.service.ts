// ──────────────────────────────────────────────
// Grok Auditor Service — AI Security Audit
// ──────────────────────────────────────────────
// Uses Grok API (xAI) to generate a Security Clearance
// Certificate for submitted mini-app plugins.

import axios from 'axios';
import { createError } from '../../shared/middleware/error.middleware.js';

const XAI_API_KEY = process.env.XAI_API_KEY || '';
const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';

interface PluginSubmissionForAudit {
  name: string;
  deploymentUrl: string;
  category: string;
  permissions: string[];
}

interface SecurityClearanceCertificate {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  findings: string[];
  recommendation: 'APPROVE' | 'REJECT' | 'MANUAL_REVIEW';
  compliance: string;
}

/**
 * Generate a Security Clearance Certificate for a plugin submission.
 * Calls Grok API with structured output format.
 */
export async function generateSecurityAudit(
  submission: PluginSubmissionForAudit
): Promise<SecurityClearanceCertificate> {
  if (!XAI_API_KEY) {
    // Return a mock audit if Grok is not configured
    return {
      riskLevel: 'LOW',
      findings: ['Grok API not configured — mock audit generated'],
      recommendation: 'MANUAL_REVIEW',
      compliance: 'Unable to verify — API key not set',
    };
  }

  const systemPrompt = `You are a security auditor for Aether, a campus operating system. 
Analyze the following web application submission for security risks.
You MUST respond with ONLY a valid JSON object in this exact format:
{
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "findings": ["finding1", "finding2", ...],
  "recommendation": "APPROVE" | "REJECT" | "MANUAL_REVIEW",
  "compliance": "Brief compliance assessment"
}
Do not include any other text outside the JSON.`;

  const userPrompt = `Analyze this mini-app plugin submission:
- App Name: ${submission.name}
- Deployment URL: ${submission.deploymentUrl}
- Category: ${submission.category}
- Requested Permissions: ${submission.permissions.join(', ') || 'None'}

Assess the security risk based on:
1. The deployment URL domain and protocol (HTTPS required)
2. Requested permissions scope
3. Category appropriateness
4. General web security best practices`;

  try {
    const response = await axios.post(
      XAI_API_URL,
      {
        model: 'grok-3-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${XAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices?.[0]?.message?.content || '';

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse Grok response as JSON');
    }

    const certificate = JSON.parse(jsonMatch[0]) as SecurityClearanceCertificate;

    // Validate fields
    if (!['LOW', 'MEDIUM', 'HIGH'].includes(certificate.riskLevel)) {
      certificate.riskLevel = 'MEDIUM';
    }
    if (!['APPROVE', 'REJECT', 'MANUAL_REVIEW'].includes(certificate.recommendation)) {
      certificate.recommendation = 'MANUAL_REVIEW';
    }
    if (!Array.isArray(certificate.findings)) {
      certificate.findings = [];
    }

    return certificate;
  } catch (error: unknown) {
    // If Grok fails, return a manual review recommendation
    const message = error instanceof Error ? error.message : 'Grok API call failed';
    console.error(`Grok audit failed: ${message}`);

    return {
      riskLevel: 'MEDIUM',
      findings: [`Automated audit failed: ${message}`, 'Manual review recommended'],
      recommendation: 'MANUAL_REVIEW',
      compliance: 'Unable to automatically verify',
    };
  }
}
