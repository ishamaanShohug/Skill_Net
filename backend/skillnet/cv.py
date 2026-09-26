import io
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,HRFlowable

TEMPLATES={'classic':{'heading':'Times-Bold','body':'Times-Roman'},'modern':{'heading':'Helvetica-Bold','body':'Helvetica'}}

def _accent(value):
    try:return colors.HexColor(value)
    except Exception:return colors.HexColor('#0f766e')

def _fmt(d):return d.strftime('%b %Y') if d else 'Present'

def build_cv_pdf(user,profile,options):
    sections=set(options.get('sections') or ['summary','experience','education','skills','certificates'])
    fonts=TEMPLATES.get(options.get('template'),TEMPLATES['modern'])
    accent=_accent(options.get('accent') or '#0f766e')
    buffer=io.BytesIO()
    doc=SimpleDocTemplate(buffer,pagesize=A4,topMargin=16*mm,bottomMargin=16*mm,leftMargin=18*mm,rightMargin=18*mm,title=f'{user.get_full_name()} CV')
    name_style=ParagraphStyle('name',fontName=fonts['heading'],fontSize=22,textColor=colors.HexColor('#111827'),spaceAfter=2)
    role_style=ParagraphStyle('role',fontName=fonts['body'],fontSize=12,textColor=accent,spaceAfter=6)
    contact_style=ParagraphStyle('contact',fontName=fonts['body'],fontSize=9.5,textColor=colors.HexColor('#4b5563'),spaceAfter=10)
    heading_style=ParagraphStyle('heading',fontName=fonts['heading'],fontSize=12.5,textColor=accent,spaceBefore=12,spaceAfter=4)
    body_style=ParagraphStyle('body',fontName=fonts['body'],fontSize=10,textColor=colors.HexColor('#1f2937'),leading=14)
    meta_style=ParagraphStyle('meta',fontName=fonts['body'],fontSize=9,textColor=colors.HexColor('#6b7280'),leading=12)
    entry_title_style=ParagraphStyle('entry_title',fontName=fonts['heading'],fontSize=10.5,textColor=colors.HexColor('#111827'),spaceBefore=6)

    story=[Paragraph(user.get_full_name() or user.email,name_style)]
    if profile.headline:story.append(Paragraph(profile.headline,role_style))
    contact_bits=[user.email]
    if user.phone:contact_bits.append(user.phone)
    if profile.location:contact_bits.append(profile.location)
    if profile.portfolio_url:contact_bits.append(profile.portfolio_url)
    story.append(Paragraph(' &nbsp;|&nbsp; '.join(contact_bits),contact_style))
    story.append(HRFlowable(width='100%',thickness=1,color=accent,spaceAfter=4))

    if 'summary' in sections and profile.summary:
        story.append(Paragraph('Professional summary',heading_style));story.append(Paragraph(profile.summary,body_style))
    if 'experience' in sections and profile.experience.exists():
        story.append(Paragraph('Work experience',heading_style))
        for exp in profile.experience.order_by('-start_date'):
            story.append(Paragraph(f'{exp.title} — {exp.company}',entry_title_style))
            story.append(Paragraph(f'{_fmt(exp.start_date)} – {"Present" if exp.current else _fmt(exp.end_date)}',meta_style))
            if exp.description:story.append(Paragraph(exp.description,body_style))
    if 'education' in sections and profile.education.exists():
        story.append(Paragraph('Education',heading_style))
        for edu in profile.education.order_by('-start_date'):
            story.append(Paragraph(f'{edu.degree}{" in " + edu.field if edu.field else ""} — {edu.institution}',entry_title_style))
            story.append(Paragraph(f'{_fmt(edu.start_date)} – {_fmt(edu.end_date)}',meta_style))
    if 'skills' in sections and profile.skills.exists():
        story.append(Paragraph('Skills',heading_style))
        story.append(Paragraph(', '.join(s.name for s in profile.skills.all()),body_style))
    if 'certificates' in sections and profile.certificates.exists():
        story.append(Paragraph('Certificates',heading_style))
        for cert in profile.certificates.order_by('-issued_date'):
            story.append(Paragraph(f'{cert.name} — {cert.issuer}',entry_title_style))
            story.append(Paragraph(_fmt(cert.issued_date),meta_style))

    if len(story)<=2:story.append(Spacer(1,20));story.append(Paragraph('Complete your profile to see more on your CV.',body_style))
    doc.build(story)
    buffer.seek(0)
    return buffer.read()
