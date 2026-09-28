"""
AI Ad-Copy & Hook Tester
========================
A high-converting direct-response copywriting and hook generation engine
built with Streamlit, BeautifulSoup4, and the official Google GenAI SDK (`google-genai`).

Author: Senior Full-Stack Python Developer
Requirements: streamlit, beautifulsoup4, requests, google-genai
"""

import re
import time
import urllib.parse
import requests
from bs4 import BeautifulSoup
import streamlit as st

# Official Google GenAI SDK import
from google import genai
from google.genai import types
from google.genai.errors import APIError

# ==============================================================================
# 1. PAGE CONFIGURATION & CUSTOM STYLING
# ==============================================================================

st.set_page_config(
    page_title="AI Ad-Copy & Hook Tester",
    page_icon="🎯",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom CSS for a sleek, modern, high-contrast direct-response marketer UI
st.markdown(
    """
    <style>
    /* Main container styling */
    .main .block-container {
        padding-top: 2rem;
        padding-bottom: 3rem;
        max-width: 1200px;
    }
    
    /* Hero header banner */
    .hero-banner {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        color: white;
        padding: 2.2rem 2.5rem;
        border-radius: 14px;
        margin-bottom: 2rem;
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    }
    .hero-title {
        font-size: 2.2rem;
        font-weight: 800;
        letter-spacing: -0.025em;
        margin-bottom: 0.5rem;
        color: #f8fafc;
    }
    .hero-subtitle {
        font-size: 1.05rem;
        color: #94a3b8;
        max-width: 760px;
        line-height: 1.6;
    }
    
    /* Result card containers */
    .metric-badge {
        display: inline-block;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #3b82f6;
        margin-bottom: 0.25rem;
    }
    
    /* Custom button styling */
    div.stButton > button:first-child {
        background-color: #2563eb;
        color: white;
        font-weight: 700;
        font-size: 1.05rem;
        padding: 0.75rem 2rem;
        border-radius: 10px;
        border: none;
        box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.39);
        transition: all 0.2s ease-in-out;
        width: 100%;
    }
    div.stButton > button:first-child:hover {
        background-color: #1d4ed8;
        transform: translateY(-1px);
        box-shadow: 0 6px 20px 0 rgba(37, 99, 235, 0.45);
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# ==============================================================================
# 2. SIDEBAR CONFIGURATION (API KEY & SETTINGS)
# ==============================================================================

with st.sidebar:
    # 1. SaaS Brand & Auth Buttons
    st.image("https://api.iconify.design/lucide:target.svg?color=%232563eb", width=42)
    st.markdown("### **AdCopy AI Studio**")
    st.caption("AI-Powered Viral Copy & Script Generator")
    
    # Horizontal Auth Buttons
    col_auth_login, col_auth_signup = st.columns(2)
    with col_auth_login:
        if st.button("🔑 Log In", use_container_width=True, key="btn_login"):
            st.toast("👋 Demo Session: Logged in as demo_user@adcopy.ai")
    with col_auth_signup:
        if st.button("✨ Sign Up", use_container_width=True, key="btn_signup"):
            st.toast("🎉 Pro Trial Active! Enjoy full direct-response features.")

    st.markdown("---")

    # 2. Global Output Language Selector
    selected_language = st.selectbox(
        "🌐 Output Language",
        options=[
            "English",
            "Español (Spanish)",
            "Français (French)",
            "Urdu (اردو)",
            "Hindi (हिन्दी)",
            "Deutsch (German)",
            "Português (Portuguese)",
            "Arabic (العربية)",
            "Italiano (Italian)",
            "Bengali (বাংলা)",
        ],
        index=0,
        help="Select the language for all generated ad copy, hooks, video scripts, and calls-to-action.",
    )

    st.markdown("---")

    # 3. SaaS Navigation Menu
    st.markdown("### 🧭 Navigation")
    nav_page = st.radio(
        "Navigate App",
        options=[
            "Home (Ad Generator)",
            "Pricing",
            "Features",
            "FAQ & Help",
            "Contact",
            "Legal & Privacy",
        ],
        index=0,
        label_visibility="collapsed",
    )

    st.markdown("---")
    
    # 4. Engine Settings & Quickstart Guide (Available across pages)
    with st.expander("📖 How to Use This Tool", expanded=False):
        st.info(
            "👋 **Welcome!** This tool instantly turns any product link into battle-tested, high-converting ad copy, viral video scripts, and scroll-stopping hooks tailored to your target platform."
        )
        st.markdown(
            """
            **3-Step Quickstart Guide:**
            1. **Paste your product URL** or use the **Manual Text Fallback** in Advanced Options (ideal for Amazon/Daraz).
            2. **Select your target platform** (Facebook, Instagram, YouTube, TikTok, or LinkedIn).
            3. **Click Generate** to instantly get 5 psychological hooks, 3 copy angles, and high-converting CTAs.
            """
        )

    st.markdown("### ⚙️ Engine Settings")
    
    # Secure API Key input with password masking
    api_key_input = st.text_input(
        "Gemini API Key",
        type="password",
        help="Enter your Google Gemini API key. Get one from Google AI Studio (aistudio.google.com).",
        placeholder="AIzaSy...",
    )
    
    # Model Selector
    selected_model = st.selectbox(
        "Select Gemini Model",
        options=["gemini-2.5-flash", "gemini-2.5-pro"],
        index=0,
        help="gemini-2.5-flash is ultra-fast and creative; gemini-2.5-pro offers deeper analytical copywriting reasoning.",
    )
    
    # Tone & Style Nuance
    creative_tone = st.selectbox(
        "Copywriting Tone",
        options=[
            "Direct-Response & High Urgency",
            "Bold, Punchy & Contrarian",
            "Conversational & Storytelling",
            "Authoritative & B2B Professional",
            "Relatable & Playful (Gen-Z/TikTok)",
        ],
        index=0,
    )
    
    st.markdown("---")
    st.caption("AI Ad-Copy & Hook Tester · SaaS Edition v2.0")

# ==============================================================================
# 3. WEB SCRAPING ENGINE (REQUESTS + BEAUTIFUL SOUP)
# ==============================================================================

def validate_url(url: str) -> bool:
    """Validates if the provided string is a valid HTTP/HTTPS URL."""
    try:
        parsed = urllib.parse.urlparse(url)
        return bool(parsed.scheme in ("http", "https") and parsed.netloc)
    except Exception:
        return False


def scrape_website_content(url: str) -> dict:
    """
    Scrapes key textual information from a landing page or product URL.
    
    Extracts:
    - Page Title (<title> or OpenGraph og:title)
    - Meta Description (<meta name="description"> or og:description)
    - Headings (H1, H2, H3)
    - Paragraph Text (filtered and cleaned)
    
    Returns a dictionary with status, title, description, and concatenated clean text.
    Handles HTTP errors, connection timeouts, and bot-blocking defenses gracefully.
    """
    # Realistic Desktop Browser User-Agent to prevent 403 blocks from Cloudflare/Akamai
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "DNT": "1",
        "Upgrade-Insecure-Requests": "1",
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=12)
        response.raise_for_status()
    except requests.exceptions.HTTPError as http_err:
        status_code = response.status_code if response else "Unknown"
        return {
            "success": False,
            "error": f"Website returned HTTP error {status_code}: {http_err}. The site may be blocking automated web scrapers.",
        }
    except requests.exceptions.ConnectionError:
        return {
            "success": False,
            "error": "Failed to connect to the provided URL. Please verify the link is live and accessible.",
        }
    except requests.exceptions.Timeout:
        return {
            "success": False,
            "error": "Connection timed out while trying to reach the website. The server took too long to respond.",
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"An unexpected error occurred during web scraping: {str(e)}",
        }
    
    # Parse HTML with BeautifulSoup
    soup = BeautifulSoup(response.text, "html.parser")
    
    # Strip non-content tags
    for tag in soup(["script", "style", "nav", "footer", "noscript", "svg", "iframe", "form"]):
        tag.decompose()
        
    # Extract Title
    title = ""
    if soup.title and soup.title.string:
        title = soup.title.string.strip()
    elif soup.find("meta", property="og:title"):
        title = soup.find("meta", property="og:title").get("content", "").strip()
        
    # Extract Meta Description
    meta_desc = ""
    desc_tag = soup.find("meta", attrs={"name": re.compile(r"description", re.I)}) or soup.find(
        "meta", property="og:description"
    )
    if desc_tag and desc_tag.get("content"):
        meta_desc = desc_tag["content"].strip()
        
    # Extract Headings (H1, H2, H3)
    headings = []
    for h in soup.find_all(["h1", "h2", "h3"]):
        text = h.get_text(separator=" ", strip=True)
        if text and len(text) > 4:
            headings.append(text)
            
    # Extract Paragraphs
    paragraphs = []
    for p in soup.find_all("p"):
        p_text = p.get_text(separator=" ", strip=True)
        # Filter out short menu items or cookie disclaimers
        if len(p_text) > 25 and not any(w in p_text.lower() for w in ["cookie", "privacy policy", "all rights reserved"]):
            paragraphs.append(p_text)
            
    # Combine headings & paragraphs with priority
    combined_body = "\n".join(headings[:10]) + "\n\n" + "\n".join(paragraphs[:30])
    # Sanitize whitespace
    clean_body = re.sub(r"\s+", " ", combined_body).strip()
    
    # Truncate content to avoid exceeding LLM context and focus on high-impact landing copy
    clean_body = clean_body[:10000]
    
    if len(clean_body) < 80:
        return {
            "success": False,
            "error": "The scraper was able to load the page, but found minimal readable text. The site might be rendered via client-side JavaScript (SPA) or protected by a captcha.",
        }
        
    return {
        "success": True,
        "title": title,
        "meta_description": meta_desc,
        "extracted_text": clean_body,
    }


# ==============================================================================
# 4. AI PROMPT ENGINEERING & COPY GENERATION (GOOGLE GENAI SDK)
# ==============================================================================

def generate_ad_campaign_copy(
    api_key: str,
    model_name: str,
    platform: str,
    tone: str,
    page_data: dict,
    target_audience: str = "",
    reference_video_idea: str = "",
    language: str = "English",
) -> str:
    """
    Constructs an expert direct-response prompt and queries the Google GenAI SDK.
    
    Demands:
    1. 5 Scroll-Stopping Hooks (Pattern interrupt, curiosity, shock value, direct callout)
    2. 3 Distinct Body Copy Angles (Pain-Point, Aspirational, Benefit-led)
    3. 2 High-Converting Calls-to-Action (CTAs)
    """
    # Initialize the modern official Google GenAI Client
    client = genai.Client(api_key=api_key)
    
    # Platform-specific optimization instructions
    platform_guidelines = {
        "Facebook": (
            "- Primary Text format: Optimized for feed scrolling.\n"
            "- Hook must fit in the first 2-3 lines before the '...See more' break.\n"
            "- Use short 1-2 sentence paragraphs for scannability.\n"
            "- Emphasize emotional storytelling, social proof, and problem-solution dynamics."
        ),
        "Instagram": (
            "- Instagram Caption format: Optimized for feed & Reels consumption.\n"
            "- First 125 characters before the 'more' fold must hook immediately.\n"
            "- Aesthetic formatting with purposeful spacing, punchy bullet points, and clean line breaks.\n"
            "- Include a strong engagement prompt (e.g., 'Tap the link in bio', 'Save this post', 'Comment [KEYWORD]').\n"
            "- MANDATORY: Every body copy angle MUST conclude with a curated group of 5-8 relevant, high-traffic hashtags (mix of niche & broad tags)."
        ),
        "LinkedIn": (
            "- Professional yet engaging B2B tone.\n"
            "- Clean line breaks, data-backed claims, ROI, efficiency, and professional transformation.\n"
            "- Avoid spammy hype; use thoughtful, value-first direct response."
        ),
        "TikTok": (
            "- Spoken-word script format or fast-paced on-screen text overlays.\n"
            "- First 2 seconds must be an irresistible pattern interrupt.\n"
            "- Casual, direct, authentic, UGC (User-Generated Content) style."
        ),
        "YouTube": (
            "- YouTube Video Hook Script format: Engineered to crush the 5-second 'Skip Ad' barrier or stop the YouTube Shorts feed.\n"
            "- First 5 seconds MUST deliver an immediate, unskippable hook (shocking claim, counter-intuitive visual, or acute callout).\n"
            "- Every body copy angle MUST be written as a complete video script including clear director cues:\n"
            "  * [VISUAL CUE: What appears on screen]\n"
            "  * [ON-SCREEN TEXT: Bold graphic pop-ups]\n"
            "  * [AUDIO/VOICEOVER: The exact spoken words]\n"
            "- Include a verbal call-to-action with explicit instructions to click the on-screen companion banner or pinned video link."
        ),
    }.get(platform, "- High-converting direct response format.")
    
    prompt = f"""
You are a World-Class Direct-Response Copywriter and Creative Paid Media Strategist (in the league of David Ogilvy, Gary Halbert, and Eugene Schwartz adapted for modern paid social media).

Your goal is to analyze the provided landing page/product content and craft high-converting ad copy for **{platform.upper()}**.

### TARGET PLATFORM SPECIFICS:
{platform_guidelines}

### COPYWRITING TONE:
{tone}

### 🛑 CRITICAL OUTPUT LANGUAGE DIRECTIVE:
The user has explicitly selected: **{language}**.
You MUST write all generated headlines, 5 hooks, explanation of why each hook stops the scroll, 3 body copy angles, visual cues, video scripts, calls-to-action, and testing strategy entirely in **{language}**.
Ensure native phrasing, local idioms, natural cadence, and persuasive direct-response rhythm suitable for native {language} speakers. Do not produce English text if a non-English language is chosen. Even though the product text below is in English, translate the core offer and write the ad copy natively in **{language}**.

{f"### TARGET AUDIENCE OVERRIDE: {target_audience}" if target_audience else ""}

{f'''### REFERENCE VIDEO INSPIRATION & CREATIVE VIBE (STYLE-MATCHING):
The user wants this ad copy and video script to match the exact style, format, and vibe of this reference video:
"{reference_video_idea}"
Crucial Instruction: Emulate this reference video's pacing, visual energy, camera directions, delivery cadence, and structural flow while pitching the current offer. Mirror its aesthetic and presentation style closely.''' if reference_video_idea else ""}

### EXTRACTED LANDING PAGE DATA:
- **Page Title**: {page_data.get('title', 'N/A')}
- **Meta Description**: {page_data.get('meta_description', 'N/A')}
- **Extracted Core Body & Offer Content**:
\"\"\"{page_data.get('extracted_text', '')}\"\"\"

---

### YOUR DELIVERABLE FORMAT:
You MUST structure your response with exact headers and clean Markdown formatting as follows:

# 🎯 CAMPAIGN STRATEGY & OFFER SUMMARY
- **The Core Offer / Value Prop**: [1-2 sentences summarizing what makes this irresistible]
- **Primary Pain Point Addressed**: [The acute symptom or frustration solved]
- **Target Persona**: [Who is most likely to click and buy today]

---

# 🪝 5 SCROLL-STOPPING HOOKS
Write 5 distinct, thumb-stopping hooks specifically crafted for {platform}. Each hook must use a different psychological angle:
1. **Hook 1 (The Pattern Interrupt / Counter-Intuitive)**: [A bold statement that defies common wisdom]
2. **Hook 2 (The Negative Callout / Pain Avoidance)**: [Exposing an expensive mistake or hidden trap]
3. **Hook 3 (The 'If You / Stop Scrolling' Qualifier)**: [Direct callout to the exact target audience]
4. **Hook 4 (The Curiosity Gap / Secret Mechanism)**: [Teasing the unique mechanism without giving away the punchline]
5. **Hook 5 (The Proof / Metric-Driven)**: [Leading with a tangible transformation or benchmark]

---

# 📝 3 DISTINCT BODY COPY ANGLES
Each angle must be complete, ready-to-run ad copy for {platform}, including its own opening hook, narrative body, and CTA transition.

### Angle 1: The Pain-Point & Agitation Angle (PAS Framework)
- **Concept**: Agitate the existing frustration, show the cost of inaction, and present this offer as the definitive relief.
- **Copy**:
[Write the full ready-to-post ad copy here]

### Angle 2: The Aspirational & Identity Transformation Angle
- **Concept**: Appeal to the customer's desired future self, prestige, freedom, or mastery.
- **Copy**:
[Write the full ready-to-post ad copy here]

### Angle 3: The Benefit-Led & Mechanism Angle (Logical Proof)
- **Concept**: Highlight the unique mechanism, features turned into undeniable concrete benefits, and low risk.
- **Copy**:
[Write the full ready-to-post ad copy here]

---

# 🚀 2 HIGH-CONVERTING CALLS-TO-ACTION (CTAs)
1. **CTA 1 (Direct Action & Urgency)**: [Compelling micro-copy with an urgent benefit reason to click now]
2. **CTA 2 (Low Friction / Risk Reversal)**: [No-risk, zero-commitment trial or exploration CTA]

---

# 💡 A/B TESTING RECOMMENDATION
- **Recommended First Test**: [Which hook + which angle to pit against each other for the initial split test]
"""

    max_retries = 3
    retry_delay = 5  # seconds

    for attempt in range(max_retries + 1):
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.85,
                    top_p=0.95,
                ),
            )
            return response.text
        except Exception as e:
            err_str = str(e).lower()
            err_code = getattr(e, "code", None)
            
            # Check for 503 High Demand or server capacity issues
            is_high_demand = (
                err_code == 503
                or "503" in err_str
                or "high demand" in err_str
                or "overloaded" in err_str
                or "unavailable" in err_str
                or "resource_exhausted" in err_str
                or "temporarily unavailable" in err_str
            )

            # If it is a 503 High Demand error and retries remain, do not show error; wait 5s and retry
            if is_high_demand and attempt < max_retries:
                time.sleep(retry_delay)
                continue
            else:
                # Re-raise error if not a 503 or all 3 retries have been exhausted
                raise e

    raise RuntimeError("Failed to generate ad copy after 3 retry attempts.")


# ==============================================================================
# 5. USER INTERFACE & SAAS PAGE ROUTING
# ==============================================================================

# ------------------------------------------------------------------------------
# PAGE 1: HOME (AD GENERATOR)
# ------------------------------------------------------------------------------
if nav_page == "Home (Ad Generator)":
    # Hero Section
    st.markdown(
        f"""
        <div class="hero-banner">
            <div class="hero-title">🎯 AI Ad-Copy & Hook Tester</div>
            <div class="hero-subtitle">
                Turn any landing page or product URL into battle-tested, high-converting ad copy. 
                Extracts your offer's core messaging and generates scroll-stopping hooks, multi-angle body copy, and high-CTR calls to action in <strong>{selected_language}</strong>.
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # Platform Selector (Horizontal Segmented Bar)
    platform = st.radio(
        "🎯 Target Social Platform:",
        options=["Facebook", "Instagram", "LinkedIn", "TikTok", "YouTube"],
        index=0,
        horizontal=True,
        help="Customizes the ad copy format, length, formatting conventions, and psychological hooks for the selected social channel.",
    )

    # URL Input Field
    target_url = st.text_input(
        "Product or Landing Page URL",
        placeholder="https://example.com/your-product",
        help="Paste the direct URL to the product, SaaS landing page, or sales page you want to advertise.",
    )

    # Advanced Options Accordion (Closed by default to keep the main view ultra clean)
    with st.expander("⚙️ Advanced Options (Amazon/Daraz Fallback & Custom Video Vibe)", expanded=False):
        manual_text_input = st.text_area(
            "Fallback: Manual Text Input (Optional)",
            placeholder="Paste product title, features, bullet points, or specifications directly here. Perfect for Amazon, Daraz, or AliExpress links that block web scrapers. If filled, the AI will use this manual text instead of scraping...",
            help="Directly paste product info from sites that block web scrapers. If filled, web scraping is automatically skipped.",
            height=110,
        )

        reference_video_idea = st.text_input(
            "Reference Video Idea",
            placeholder="e.g. Fast-paced walking monologue holding a microphone, tech unboxing with ASMR sounds, or split-screen 'Before vs After' reaction...",
            help="Describe a video you liked (its visual style, pacing, format, or vibe). The AI will emulate this style when generating your hooks and ad scripts.",
        )

        target_audience = st.text_input(
            "Target Audience / Persona (Optional)",
            placeholder="e.g. E-commerce founders scaling past $50k/mo, busy working moms, freelance developers",
            help="Optional: Leave blank to let the AI automatically deduce the ideal persona from the page content.",
        )

    # Prominent Action Button
    generate_btn = st.button(f"🚀 Generate {selected_language} Ad Copy & Hooks", use_container_width=True)

    # Process Trigger
    if generate_btn:
        # 1. Validation Checks
        if not api_key_input:
            st.error("🔑 **API Key Missing**: Please provide your Gemini API Key in the left sidebar to generate ad copy.")
            st.info("You can get a free API key at [Google AI Studio](https://aistudio.google.com).")
            st.stop()
            
        has_manual_text = bool(manual_text_input and manual_text_input.strip())
        has_url = bool(target_url and target_url.strip())

        if not has_url and not has_manual_text:
            st.error("🔗 **Input Missing**: Please enter a landing page URL or paste your product text in the 'Fallback: Manual Text Input' box.")
            st.stop()

        scrape_result = {}
        clean_url = target_url.strip() if has_url else "Manual Direct Input"

        if has_url and not clean_url.startswith(("http://", "https://")):
            clean_url = "https://" + clean_url

        # Check if manual text fallback is supplied
        if has_manual_text:
            # User supplied manual text -> BYPASS WEB SCRAPING COMPLETELY!
            page_title = "Manual Product Description"
            if has_url:
                try:
                    page_title = urllib.parse.urlparse(clean_url).netloc or "Product Offer"
                except Exception:
                    page_title = "Product Offer"

            scrape_result = {
                "success": True,
                "title": page_title,
                "meta_description": "Manual text description provided by user",
                "extracted_text": manual_text_input.strip(),
            }
            st.info("⚡ **Using Manual Text**: Web scraping skipped. Generating ad copy directly from your pasted product description.")
        else:
            # Standard web scraping flow
            if not validate_url(clean_url):
                st.error("❌ **Invalid URL**: Please enter a valid web address (e.g., https://mybrand.com/product) or paste product text in the manual box.")
                st.stop()

            # 2. Web Scraping Step
            with st.spinner(f"🔍 Step 1/2: Scraping landing page content from {clean_url}..."):
                scrape_result = scrape_website_content(clean_url)
                
            if not scrape_result["success"]:
                st.error(f"⚠️ **Scraping Failed**: {scrape_result['error']}")
                st.warning("💡 **Tip**: If this site blocks scrapers (like Amazon or Daraz), copy the product description from the page and paste it into the **'Fallback: Manual Text Input'** box above, then click generate again!")
                st.stop()
                
            st.success(f"✅ Successfully scraped: **{scrape_result.get('title', 'Page Loaded')}**")
        
        # Quick Scraping / Text Overview
        with st.expander("📄 View Landing Page & Offer Text Summary"):
            st.markdown(f"**Extracted / Provided Title**: {scrape_result.get('title', 'N/A')}")
            if scrape_result.get("meta_description"):
                st.markdown(f"**Meta Description**: {scrape_result['meta_description']}")
            st.markdown(f"**Sample Text Preview** ({len(scrape_result.get('extracted_text', ''))} characters):")
            st.code(scrape_result.get("extracted_text", "")[:600] + "...")

        # 3. AI Generation Step
        with st.spinner(f"🧠 Step 2/2: Direct-Response AI is generating 5 hooks, 3 copy angles & CTAs for {platform} in {selected_language}..."):
            try:
                ad_copy_result = generate_ad_campaign_copy(
                    api_key=api_key_input.strip(),
                    model_name=selected_model,
                    platform=platform,
                    tone=creative_tone,
                    page_data=scrape_result,
                    target_audience=target_audience.strip(),
                    reference_video_idea=reference_video_idea.strip(),
                    language=selected_language,
                )
                
                # Save into session state so results persist across interactions
                st.session_state["last_result"] = ad_copy_result
                st.session_state["last_platform"] = platform
                st.session_state["last_url"] = clean_url
                st.session_state["last_lang"] = selected_language
                
            except APIError as api_err:
                st.error(f"❌ **Gemini API Error**: {api_err.message if hasattr(api_err, 'message') else str(api_err)}")
                st.info("Check your API key in the sidebar and ensure it is valid with sufficient quota.")
                st.stop()
            except Exception as gen_err:
                st.error(f"❌ **Generation Error**: An unexpected error occurred: {str(gen_err)}")
                st.stop()

    # Results Display
    if "last_result" in st.session_state:
        st.markdown("---")
        st.subheader(f"📊 Generated Ad Copy Package for {st.session_state.get('last_platform', 'Social Media')} ({st.session_state.get('last_lang', 'English')})")
        st.caption(f"Source URL: {st.session_state.get('last_url', '')}")
        
        # Main Render of the Copy Deliverable
        st.markdown(st.session_state["last_result"])
        
        # Download / Export Button for easy offline saving
        st.download_button(
            label="📥 Download Copy Pack (.txt)",
            data=st.session_state["last_result"],
            file_name=f"ad_copy_{st.session_state.get('last_platform', 'campaign').lower()}.txt",
            mime="text/plain",
            use_container_width=True,
        )

# ------------------------------------------------------------------------------
# PAGE 2: PRICING
# ------------------------------------------------------------------------------
elif nav_page == "Pricing":
    st.markdown(
        """
        <div class="hero-banner">
            <div class="hero-title">💳 Simple, Transparent SaaS Pricing</div>
            <div class="hero-subtitle">
                Supercharge your ROAS with AI-engineered hooks and multi-angle ad scripts. No long-term commitments.
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    col1, col2, col3 = st.columns(3)

    with col1:
        st.markdown("### 🆓 Free Starter")
        st.markdown("**$0** / forever")
        st.markdown("Ideal for testing the water with 1 product.")
        st.markdown(
            """
            - ✅ 5 Ad Campaigns / month
            - ✅ 5 Hooks & 3 Angles per generation
            - ✅ Standard Web Scraping
            - ✅ All 5 Social Platforms
            - ❌ Style-Matching Video Engine
            """
        )
        if st.button("Current Plan", use_container_width=True, disabled=True):
            pass

    with col2:
        st.markdown("### 🚀 Pro Marketer")
        st.markdown("**$29** / month")
        st.markdown("For media buyers, DTC founders & creators.")
        st.markdown(
            """
            - ✅ **Unlimited** Ad Campaigns
            - ✅ **Reference Video Style-Matching**
            - ✅ **Amazon/Daraz Anti-Bot Fallback**
            - ✅ **All 10+ Languages**
            - ✅ Priority Gemini 2.5 Pro Access
            - ✅ 1-Click Export to .txt / CSV
            """
        )
        if st.button("Upgrade to Pro", use_container_width=True, key="upgrade_pro"):
            st.balloons()
            st.success("🎉 Upgrade request received! Redirecting to secure checkout...")

    with col3:
        st.markdown("### 🏢 Agency Scale")
        st.markdown("**$79** / month")
        st.markdown("For high-volume performance marketing agencies.")
        st.markdown(
            """
            - ✅ Everything in Pro Marketer
            - ✅ **5 Team Seats** Included
            - ✅ Custom Hook Archetype Builder
            - ✅ Dedicated Account Manager
            - ✅ REST API Access
            - ✅ Commercial White-Label Rights
            """
        )
        if st.button("Contact Enterprise", use_container_width=True, key="upgrade_agency"):
            st.info("📨 Please email sales@adcopy.ai for custom invoice arrangements.")

# ------------------------------------------------------------------------------
# PAGE 3: FEATURES
# ------------------------------------------------------------------------------
elif nav_page == "Features":
    st.markdown(
        """
        <div class="hero-banner">
            <div class="hero-title">⚡ High-Converting Engine Features</div>
            <div class="hero-subtitle">
                Engineered from the ground up for paid media buyers who need to lower cost-per-acquisition (CPA).
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    f_col1, f_col2 = st.columns(2)

    with f_col1:
        st.markdown("#### 1. 🔍 Deep Landing Page Extraction")
        st.write(
            "Automatically extracts your product's title, meta tags, H1-H3 hierarchy, and offer descriptions using BeautifulSoup without needing manual data entry."
        )

        st.markdown("#### 2. 🪝 5 Proven Scroll-Stopping Hook Archetypes")
        st.write(
            "Generates 5 distinct psychological hooks per product: Curiosity Gaps, Pattern Interrupts, Problem-Agitation, Contrarian Takes, and Social Proof triggers."
        )

        st.markdown("#### 3. 🎬 Video Script & Visual Cue Director")
        st.write(
            "Every YouTube and TikTok generation includes clear director cues: `[VISUAL CUE:]`, `[ON-SCREEN TEXT:]`, and `[AUDIO/VOICEOVER:]` to hand directly to creators."
        )

    with f_col2:
        st.markdown("#### 4. 🛡️ Anti-Bot Scraper Bypass")
        st.write(
            "Direct manual fallback text area allows you to copy and paste product bullet points from secure platforms like Amazon, Daraz, or AliExpress without 403 errors."
        )

        st.markdown("#### 5. 🌐 10+ Native Global Languages")
        st.write(
            "Produce culturally-nuanced ad copy in English, Spanish, French, Urdu, Hindi, German, Arabic, and more with native idioms and persuasion rhythm."
        )

        st.markdown("#### 6. 🎥 Reference Video Style-Matching")
        st.write(
            "Describe any viral video concept (e.g. walking office vlog, unboxing ASMR) and the AI will mirror its visual cadence and structural flow."
        )

# ------------------------------------------------------------------------------
# PAGE 4: FAQ & HELP
# ------------------------------------------------------------------------------
elif nav_page == "FAQ & Help":
    st.markdown(
        """
        <div class="hero-banner">
            <div class="hero-title">❓ Frequently Asked Questions & Help</div>
            <div class="hero-subtitle">
                Everything you need to know about scraping, Gemini models, and commercial licensing.
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    with st.expander("Q: How does the AI extract information from my landing page?"):
        st.write(
            "The app uses Python's `requests` library paired with `BeautifulSoup4` to parse the clean HTML. It strips away navigation menus, footers, and tracking scripts to isolate the product value proposition, headlines, and core pricing."
        )

    with st.expander("Q: What if my website blocks automated scraping (e.g. Amazon or Daraz)?"):
        st.write(
            "Enterprise sites frequently implement Cloudflare or Akamai bot-detection. When this occurs, simply open the **'⚙️ Advanced Options'** accordion on the home page and paste your product bullets directly into the **'Fallback: Manual Text Input'** box. The scraper will be completely bypassed!"
        )

    with st.expander("Q: How do I get a Google Gemini API Key?"):
        st.write(
            "You can generate a free API key at [Google AI Studio](https://aistudio.google.com). Once generated, paste it into the password field in the sidebar. Your key remains private in your local browser session."
        )

    with st.expander("Q: Do I own full commercial rights to the generated copy?"):
        st.write(
            "Yes! You retain 100% commercial ownership of all hooks, ad copy variations, and video scripts generated by the platform. You may run them on paid ad channels or resell them to clients."
        )

# ------------------------------------------------------------------------------
# PAGE 5: CONTACT
# ------------------------------------------------------------------------------
elif nav_page == "Contact":
    st.markdown(
        """
        <div class="hero-banner">
            <div class="hero-title">📬 Contact & Support</div>
            <div class="hero-subtitle">
                Have questions, feature requests, or partnership inquiries? We'd love to hear from you.
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    with st.form("contact_form"):
        st.markdown("#### Send us a message")
        c_name = st.text_input("Your Full Name", placeholder="Jane Doe")
        c_email = st.text_input("Work Email Address", placeholder="jane@company.com")
        c_subject = st.selectbox("Subject Category", ["Technical Support", "Feature Request", "Billing Question", "Partnership / Agency"])
        c_message = st.text_area("Your Message", placeholder="Tell us how we can help...", height=120)
        
        submitted = st.form_submit_button("✉️ Send Message", use_container_width=True)
        if submitted:
            if not c_name or not c_email or not c_message:
                st.error("Please fill out all required fields before submitting.")
            else:
                st.success("✅ Thank you! Your message has been sent to support@adcopy.ai. Our team typically replies within 2-4 hours.")

    st.markdown("---")
    st.markdown("📍 **Direct Support**: support@adcopy.ai | 💬 **Community Discord**: discord.gg/adcopystudio")

# ------------------------------------------------------------------------------
# PAGE 6: LEGAL & PRIVACY
# ------------------------------------------------------------------------------
elif nav_page == "Legal & Privacy":
    st.markdown(
        """
        <div class="hero-banner">
            <div class="hero-title">⚖️ Legal, Privacy & Compliance</div>
            <div class="hero-subtitle">
                Our commitment to data privacy, ethical AI usage, and regulatory compliance.
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.markdown("### 🔒 Privacy Policy")
    st.write(
        """
        - **Zero Data Resale**: We never sell, rent, or monetize your product data, generated copy, or user credentials.
        - **API Key Security**: User-provided Google Gemini API keys are processed strictly within your execution session and are never logged to public databases.
        - **Scraped Content Handling**: Landing page text extracted during scraping is utilized exclusively for generating ad copy prompts and is discarded after execution.
        """
    )

    st.markdown("### 📜 Terms of Service")
    st.write(
        """
        - **Responsible Advertising**: Users agree not to utilize this tool to generate misleading, deceptive, or prohibited advertising content under FTC regulations and platform policies (Meta, Google, ByteDance).
        - **AI Content Verification**: While the generative engine strives for high commercial accuracy, users are responsible for fact-checking claims, pricing, and warranties prior to launching paid campaigns.
        - **Fair Use & Rate Limits**: Automated batch scraping is subject to reasonable platform usage to prevent denial-of-service on target product servers.
        """
    )
    st.caption("Last Updated: September 2026 · AdCopy AI Studio Inc.")
