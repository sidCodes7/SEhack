#!/usr/bin/env python3
"""
AquaSentinel — Alert Report Generator
Generates a styled 1-page PDF report for a dispatch alert using fpdf2.
Accepts alert data as a JSON string via command-line argument.
Outputs the PDF to stdout as binary.
"""

import sys
import json
import math
import os
from datetime import datetime, timedelta
from fpdf import FPDF

# ─── Mock data for charts ───────────────────────────────────────────────
MOCK_SST_HOURLY = [27.2, 27.4, 27.8, 28.1, 28.6, 29.1, 29.8, 30.2, 30.5, 30.1, 29.7, 29.3]
MOCK_DO_HOURLY  = [6.8, 6.5, 6.1, 5.7, 5.2, 4.8, 4.3, 4.0, 3.8, 4.1, 4.5, 4.9]
MOCK_PH_HOURLY  = [8.12, 8.10, 8.08, 8.05, 8.01, 7.97, 7.93, 7.90, 7.88, 7.91, 7.95, 7.99]
MOCK_METRICS = {
    'SST': {'value': 30.2, 'baseline': 27.5, 'unit': 'degC', 'status': 'critical'},
    'Dissolved O2': {'value': 3.8, 'baseline': 6.5, 'unit': 'mg/L', 'status': 'warning'},
    'Chlorophyll-a': {'value': 4.2, 'baseline': 0.8, 'unit': 'mg/m3', 'status': 'critical'},
    'pH': {'value': 7.88, 'baseline': 8.10, 'unit': '', 'status': 'warning'},
    'Turbidity': {'value': 12.5, 'baseline': 2.1, 'unit': 'NTU', 'status': 'watch'},
    'Salinity': {'value': 34.8, 'baseline': 35.2, 'unit': 'PSU', 'status': 'normal'},
}


class AquaSentinelReport(FPDF):
    """Custom PDF class for AquaSentinel alert reports."""

    # Color palette
    BG_DARK = (15, 20, 30)
    BG_CARD = (22, 28, 42)
    BG_CARD_LIGHT = (30, 38, 55)
    ACCENT_TEAL = (0, 212, 170)
    ACCENT_BLUE = (51, 154, 240)
    SEVERITY_CRITICAL = (255, 59, 92)
    SEVERITY_WARNING = (255, 159, 67)
    SEVERITY_WATCH = (255, 217, 61)
    SEVERITY_NORMAL = (0, 212, 170)
    TEXT_PRIMARY = (240, 242, 245)
    TEXT_DIM = (130, 140, 160)
    WHITE = (255, 255, 255)

    def __init__(self, alert_data):
        super().__init__(orientation='P', unit='mm', format='A4')
        self.alert = self._sanitize(alert_data)
        self.set_auto_page_break(auto=False)

    @staticmethod
    def _sanitize(data):
        """Replace non-latin-1 characters so Helvetica font works."""
        replacements = {
            '\u2014': '-',   # em dash
            '\u2013': '-',   # en dash
            '\u2019': "'",   # right single quote
            '\u2018': "'",   # left single quote
            '\u201c': '"',   # left double quote
            '\u201d': '"',   # right double quote
            '\u2026': '...',  # ellipsis
            '\u2192': '->',  # right arrow
            '\u2190': '<-',  # left arrow
            '\u2082': '2',   # subscript 2
            '\u2083': '3',   # subscript 3
            '\u00b3': '3',   # superscript 3
            '\u2103': 'degC', # degree celsius symbol
        }
        if isinstance(data, dict):
            return {k: AquaSentinelReport._sanitize(v) for k, v in data.items()}
        elif isinstance(data, str):
            for old, new in replacements.items():
                data = data.replace(old, new)
            # Fallback: encode to latin-1, replacing anything that still fails
            data = data.encode('latin-1', errors='replace').decode('latin-1')
            return data
        elif isinstance(data, list):
            return [AquaSentinelReport._sanitize(v) for v in data]
        return data

    def _severity_color(self, severity=None):
        s = (severity or self.alert.get('severity', 'warning')).lower()
        return {
            'critical': self.SEVERITY_CRITICAL,
            'warning': self.SEVERITY_WARNING,
            'watch': self.SEVERITY_WATCH,
        }.get(s, self.SEVERITY_NORMAL)

    def _draw_bg(self):
        self.set_fill_color(*self.BG_DARK)
        self.rect(0, 0, 210, 297, 'F')

    def _draw_header(self):
        """Top banner with logo text, severity badge, and report metadata."""
        # Header bar
        self.set_fill_color(18, 24, 38)
        self.rect(0, 0, 210, 32, 'F')

        # Bottom accent line
        sc = self._severity_color()
        self.set_draw_color(*sc)
        self.set_line_width(0.8)
        self.line(0, 32, 210, 32)

        # Logo / Title
        self.set_xy(12, 6)
        self.set_font('Helvetica', 'B', 16)
        self.set_text_color(*self.ACCENT_TEAL)
        self.cell(0, 8, 'AQUASENTINEL')

        self.set_xy(12, 14)
        self.set_font('Helvetica', '', 7)
        self.set_text_color(*self.TEXT_DIM)
        self.cell(0, 5, 'AI-Powered Marine Environmental Intelligence Platform')

        self.set_xy(12, 20)
        self.set_font('Helvetica', '', 6)
        self.set_text_color(*self.TEXT_DIM)
        report_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S IST')
        self.cell(0, 5, f'Report Generated: {report_time}')

        # Severity badge
        sev = self.alert.get('severity', 'WARNING').upper()
        badge_w = self.get_string_width(sev) + 14
        badge_x = 210 - badge_w - 12
        self.set_fill_color(*sc)
        self.set_xy(badge_x, 8)
        self.set_font('Helvetica', 'B', 9)
        self.set_text_color(*self.WHITE)
        self.cell(badge_w, 8, sev, align='C', fill=True)

        # Report ID
        self.set_xy(badge_x - 2, 18)
        self.set_font('Helvetica', '', 6)
        self.set_text_color(*self.TEXT_DIM)
        report_id = f"RPT-{self.alert.get('id', '0000')}-{datetime.now().strftime('%y%m%d')}"
        self.cell(badge_w + 4, 5, report_id, align='R')

    def _draw_alert_summary(self, y):
        """Main alert summary card."""
        card_h = 36
        self.set_fill_color(*self.BG_CARD)
        self.rect(10, y, 190, card_h, 'F')

        # Left accent bar
        sc = self._severity_color()
        self.set_fill_color(*sc)
        self.rect(10, y, 2.5, card_h, 'F')

        # Title
        self.set_xy(16, y + 3)
        self.set_font('Helvetica', 'B', 11)
        self.set_text_color(*self.TEXT_PRIMARY)
        zone_name = self.alert.get('zone_name', 'Unknown Zone')
        label = self.alert.get('label', 'Environmental Alert')
        self.cell(0, 6, f'{zone_name} - {label}')

        # Subject line
        self.set_xy(16, y + 10)
        self.set_font('Helvetica', '', 7)
        self.set_text_color(*self.TEXT_DIM)
        subject = self.alert.get('subject', '')
        self.cell(0, 4, subject[:90])

        # Details row
        self.set_xy(16, y + 17)
        self.set_font('Helvetica', '', 6.5)
        self.set_text_color(*self.ACCENT_BLUE)
        confidence = self.alert.get('confidence', 0)
        self.cell(40, 4, f'Confidence: {confidence}%')
        self.set_text_color(*self.TEXT_DIM)
        recipient = self.alert.get('recipient', 'N/A')
        self.cell(60, 4, f'Recipient: {recipient}')
        self.set_text_color(*self.ACCENT_TEAL)
        self.cell(40, 4, f'Zone: {zone_name}')

        # Reasoning
        self.set_xy(16, y + 23)
        self.set_font('Helvetica', '', 6)
        self.set_text_color(*self.TEXT_DIM)
        reasoning = self.alert.get('reasoning', 'No reasoning provided.')
        # Wrap reasoning text
        self.multi_cell(180, 3.5, reasoning[:250], align='L')

        return y + card_h + 4

    def _draw_metrics_grid(self, y):
        """6-cell metrics grid with status indicators."""
        self.set_xy(10, y)
        self.set_font('Helvetica', 'B', 8)
        self.set_text_color(*self.TEXT_PRIMARY)
        self.cell(0, 5, 'ENVIRONMENTAL METRICS SNAPSHOT')
        y += 7

        col_w = 60
        row_h = 18
        metrics = list(MOCK_METRICS.items())

        for i, (name, data) in enumerate(metrics):
            col = i % 3
            row = i // 3
            x = 10 + col * (col_w + 5)
            cy = y + row * (row_h + 3)

            # Card bg
            self.set_fill_color(*self.BG_CARD_LIGHT)
            self.rect(x, cy, col_w, row_h, 'F')

            # Status dot
            status_color = {
                'critical': self.SEVERITY_CRITICAL,
                'warning': self.SEVERITY_WARNING,
                'watch': self.SEVERITY_WATCH,
                'normal': self.SEVERITY_NORMAL,
            }.get(data['status'], self.TEXT_DIM)

            self.set_fill_color(*status_color)
            self.ellipse(x + 3, cy + 3, 3, 3, 'F')

            # Metric name
            self.set_xy(x + 8, cy + 2)
            self.set_font('Helvetica', '', 5.5)
            self.set_text_color(*self.TEXT_DIM)
            self.cell(30, 3, name.upper())

            # Value
            self.set_xy(x + 3, cy + 8)
            self.set_font('Helvetica', 'B', 10)
            self.set_text_color(*self.TEXT_PRIMARY)
            self.cell(25, 5, f"{data['value']}")

            # Unit
            self.set_font('Helvetica', '', 6)
            self.set_text_color(*self.TEXT_DIM)
            self.cell(10, 5, data['unit'])

            # Baseline
            self.set_xy(x + 3, cy + 13.5)
            self.set_font('Helvetica', '', 5)
            self.set_text_color(*self.TEXT_DIM)
            delta = data['value'] - data['baseline']
            sign = '+' if delta >= 0 else ''
            self.cell(col_w - 6, 3, f"Baseline: {data['baseline']} ({sign}{delta:.1f})")

        return y + 2 * (row_h + 3) + 4

    def _draw_line_chart(self, x, y, w, h, data, title, color, y_label='', baseline=None):
        """Draw a mini line chart with filled area."""
        # Card bg
        self.set_fill_color(*self.BG_CARD)
        self.rect(x, y, w, h, 'F')

        # Title
        self.set_xy(x + 3, y + 2)
        self.set_font('Helvetica', 'B', 6)
        self.set_text_color(*self.TEXT_PRIMARY)
        self.cell(w - 6, 4, title)

        # Y label
        self.set_xy(x + w - 20, y + 2)
        self.set_font('Helvetica', '', 5)
        self.set_text_color(*self.TEXT_DIM)
        self.cell(17, 4, y_label, align='R')

        # Chart area
        chart_x = x + 8
        chart_y = y + 9
        chart_w = w - 14
        chart_h = h - 16

        min_v = min(data) - (max(data) - min(data)) * 0.1
        max_v = max(data) + (max(data) - min(data)) * 0.1
        if max_v == min_v:
            max_v = min_v + 1

        # Grid lines
        self.set_draw_color(40, 50, 70)
        self.set_line_width(0.15)
        for i in range(5):
            gy = chart_y + chart_h * i / 4
            self.line(chart_x, gy, chart_x + chart_w, gy)

        # Y-axis labels
        self.set_font('Helvetica', '', 4)
        self.set_text_color(*self.TEXT_DIM)
        for i in range(5):
            val = max_v - (max_v - min_v) * i / 4
            gy = chart_y + chart_h * i / 4
            self.set_xy(x + 1, gy - 1.5)
            self.cell(6, 3, f'{val:.1f}', align='R')

        # Baseline reference line
        if baseline is not None and min_v <= baseline <= max_v:
            bl_y = chart_y + chart_h * (max_v - baseline) / (max_v - min_v)
            self.set_draw_color(*self.ACCENT_TEAL)
            self.set_line_width(0.2)
            self.set_dash_pattern(dash=1, gap=1)
            self.line(chart_x, bl_y, chart_x + chart_w, bl_y)
            self.set_dash_pattern(dash=0, gap=0)

        # Data points & lines
        points = []
        for i, val in enumerate(data):
            px = chart_x + (i / (len(data) - 1)) * chart_w
            py = chart_y + chart_h * (max_v - val) / (max_v - min_v)
            points.append((px, py))

        # Filled area under line
        r, g, b = color
        self.set_fill_color(r, g, b)

        # Line
        self.set_draw_color(*color)
        self.set_line_width(0.6)
        for i in range(len(points) - 1):
            self.line(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1])

        # Data points
        self.set_fill_color(*color)
        for px, py in points:
            self.ellipse(px - 0.8, py - 0.8, 1.6, 1.6, 'F')

        # X-axis labels
        self.set_font('Helvetica', '', 4)
        self.set_text_color(*self.TEXT_DIM)
        for i in range(0, len(data), 3):
            px = chart_x + (i / (len(data) - 1)) * chart_w
            self.set_xy(px - 4, chart_y + chart_h + 1)
            self.cell(8, 3, f'{i * 2}h', align='C')

    def _draw_bar_chart(self, x, y, w, h, title):
        """Draw a severity distribution bar chart."""
        # Card bg
        self.set_fill_color(*self.BG_CARD)
        self.rect(x, y, w, h, 'F')

        # Title
        self.set_xy(x + 3, y + 2)
        self.set_font('Helvetica', 'B', 6)
        self.set_text_color(*self.TEXT_PRIMARY)
        self.cell(w - 6, 4, title)

        # Data
        categories = ['Critical', 'Warning', 'Watch', 'Normal']
        values = [3, 7, 12, 18]
        colors_list = [self.SEVERITY_CRITICAL, self.SEVERITY_WARNING, self.SEVERITY_WATCH, self.SEVERITY_NORMAL]
        max_val = max(values)

        bar_area_x = x + 18
        bar_area_y = y + 10
        bar_area_w = w - 24
        bar_h = 5.5

        for i, (cat, val, col) in enumerate(zip(categories, values, colors_list)):
            by = bar_area_y + i * (bar_h + 3)
            bar_w = (val / max_val) * bar_area_w

            # Label
            self.set_xy(x + 3, by)
            self.set_font('Helvetica', '', 5)
            self.set_text_color(*self.TEXT_DIM)
            self.cell(14, bar_h, cat, align='R')

            # Bar background
            self.set_fill_color(40, 50, 70)
            self.rect(bar_area_x, by, bar_area_w, bar_h, 'F')

            # Bar fill
            self.set_fill_color(*col)
            self.rect(bar_area_x, by, bar_w, bar_h, 'F')

            # Value label
            self.set_xy(bar_area_x + bar_w + 2, by)
            self.set_font('Helvetica', 'B', 5)
            self.set_text_color(*col)
            self.cell(10, bar_h, str(val))

    def _draw_risk_gauge(self, x, y, w, h):
        """Draw a risk assessment gauge / score card."""
        self.set_fill_color(*self.BG_CARD)
        self.rect(x, y, w, h, 'F')

        self.set_xy(x + 3, y + 2)
        self.set_font('Helvetica', 'B', 6)
        self.set_text_color(*self.TEXT_PRIMARY)
        self.cell(w - 6, 4, 'RISK ASSESSMENT')

        confidence = self.alert.get('confidence', 75)
        risk_score = min(100, int(confidence * 1.05))

        # Large score number
        self.set_xy(x + 3, y + 10)
        self.set_font('Helvetica', 'B', 22)
        sc = self._severity_color()
        self.set_text_color(*sc)
        self.cell(w - 6, 12, str(risk_score), align='C')

        self.set_xy(x + 3, y + 22)
        self.set_font('Helvetica', '', 5)
        self.set_text_color(*self.TEXT_DIM)
        self.cell(w - 6, 4, 'COMPOSITE RISK SCORE', align='C')

        # Progress bar
        bar_x = x + 6
        bar_y = y + 28
        bar_w = w - 12
        bar_h = 3

        self.set_fill_color(40, 50, 70)
        self.rect(bar_x, bar_y, bar_w, bar_h, 'F')

        fill_w = (risk_score / 100) * bar_w
        self.set_fill_color(*sc)
        self.rect(bar_x, bar_y, fill_w, bar_h, 'F')

        # Risk factors
        factors = [
            ('Metric Deviation', 85),
            ('Historical Pattern', 62),
            ('Cross-Zone Correlation', 74),
            ('Temporal Acceleration', 58),
        ]

        fy = y + 35
        for name, val in factors:
            self.set_xy(x + 5, fy)
            self.set_font('Helvetica', '', 4.5)
            self.set_text_color(*self.TEXT_DIM)
            self.cell(28, 3.5, name)

            # Mini bar
            mb_x = x + 34
            mb_w = w - 48
            self.set_fill_color(40, 50, 70)
            self.rect(mb_x, fy + 0.5, mb_w, 2.5, 'F')

            fill_w = (val / 100) * mb_w
            bar_col = self.SEVERITY_CRITICAL if val > 75 else (self.SEVERITY_WARNING if val > 60 else self.ACCENT_BLUE)
            self.set_fill_color(*bar_col)
            self.rect(mb_x, fy + 0.5, fill_w, 2.5, 'F')

            self.set_xy(x + w - 12, fy)
            self.set_font('Helvetica', 'B', 4.5)
            self.set_text_color(*bar_col)
            self.cell(8, 3.5, f'{val}%', align='R')

            fy += 5

    def _draw_recommendations(self, y):
        """Draw recommendations section."""
        self.set_fill_color(*self.BG_CARD)
        self.rect(10, y, 190, 28, 'F')

        # Accent bar
        self.set_fill_color(*self.ACCENT_TEAL)
        self.rect(10, y, 2.5, 28, 'F')

        self.set_xy(16, y + 2)
        self.set_font('Helvetica', 'B', 7)
        self.set_text_color(*self.TEXT_PRIMARY)
        self.cell(0, 4, 'RECOMMENDED ACTIONS')

        actions = [
            'Deploy field monitoring team to affected zone within 12 hours for ground-truth sensor validation.',
            'Issue coastal advisory for nearby fishing communities. Restrict diving operations in affected reef areas.',
            'Increase satellite polling frequency to 15-minute intervals. Activate cross-zone correlation monitoring.',
            'Coordinate with INCOIS and NIOT for independent satellite confirmation and oceanographic model verification.',
        ]

        ay = y + 8
        for i, action in enumerate(actions):
            self.set_xy(16, ay)
            self.set_font('Helvetica', 'B', 5.5)
            self.set_text_color(*self.ACCENT_TEAL)
            self.cell(5, 3.5, f'{i + 1}.')
            self.set_font('Helvetica', '', 5.5)
            self.set_text_color(*self.TEXT_DIM)
            self.cell(170, 3.5, action)
            ay += 4.5

        return y + 30

    def _draw_footer(self):
        """Bottom footer with disclaimer."""
        y = 285
        self.set_fill_color(18, 24, 38)
        self.rect(0, y, 210, 12, 'F')

        self.set_draw_color(*self.ACCENT_TEAL)
        self.set_line_width(0.4)
        self.line(0, y, 210, y)

        self.set_xy(12, y + 2)
        self.set_font('Helvetica', '', 4.5)
        self.set_text_color(*self.TEXT_DIM)
        self.cell(0, 3, 'AquaSentinel Environmental Intelligence  |  Automated Report  |  Confidential - For Authorized Personnel Only')

        self.set_xy(12, y + 6)
        self.cell(0, 3, f'Generated by AquaSentinel AI Pipeline v1.0.0  |  {datetime.now().strftime("%Y-%m-%d %H:%M:%S")} IST')

    def build(self):
        """Build the full report page."""
        self.add_page()
        self._draw_bg()
        self._draw_header()

        y = 37
        y = self._draw_alert_summary(y)

        # Metrics grid
        y = self._draw_metrics_grid(y)

        # Charts row — 3 charts side by side
        chart_h = 45
        chart_w = 60

        self._draw_line_chart(10, y, chart_w, chart_h, MOCK_SST_HOURLY,
                              'SEA SURFACE TEMPERATURE (24h)', self.SEVERITY_CRITICAL,
                              'degC', baseline=27.5)

        self._draw_line_chart(10 + chart_w + 5, y, chart_w, chart_h, MOCK_DO_HOURLY,
                              'DISSOLVED OXYGEN (24h)', self.ACCENT_BLUE,
                              'mg/L', baseline=6.5)

        self._draw_risk_gauge(10 + 2 * (chart_w + 5), y, chart_w, chart_h + 15)

        y += chart_h + 3

        # Second charts row
        self._draw_line_chart(10, y, 90, 38, MOCK_PH_HOURLY,
                              'OCEAN pH TREND (24h)', self.SEVERITY_WARNING,
                              'pH', baseline=8.10)

        self._draw_bar_chart(105, y, 95, 38, 'ALERT SEVERITY DISTRIBUTION (7d)')

        y += 41

        # Recommendations
        self._draw_recommendations(y)

        # Footer
        self._draw_footer()


def main():
    """
    Usage: python generate_report.py <input_json_file> <output_pdf_file>
    If no args, uses default mock data and writes to stdout.
    """
    if len(sys.argv) >= 3:
        # File-based mode: read JSON from input file, write PDF to output file
        input_path = sys.argv[1]
        output_path = sys.argv[2]
        try:
            with open(input_path, 'r', encoding='utf-8') as f:
                alert_data = json.load(f)
        except (json.JSONDecodeError, FileNotFoundError, IOError):
            alert_data = {}

        pdf = AquaSentinelReport(alert_data)
        pdf.build()
        pdf.output(output_path)
    else:
        # Standalone mode: use default mock data
        alert_data = {
            'id': 1042,
            'zone_name': 'Lakshadweep Reef System',
            'label': 'Thermal Spike',
            'severity': 'critical',
            'confidence': 87.5,
            'subject': '[CRITICAL] Lakshadweep Reef System - Thermal Spike',
            'recipient': 'ops-critical@aquasentinel.org',
            'reasoning': 'SST +2.7 deg C above 14-day baseline.',
        }

        pdf = AquaSentinelReport(alert_data)
        pdf.build()

        if len(sys.argv) == 2:
            pdf.output(sys.argv[1])
        else:
            pdf_bytes = pdf.output()
            sys.stdout.buffer.write(pdf_bytes)


if __name__ == '__main__':
    main()

