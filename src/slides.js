import roni from '../assets/agents/roni.png';
import dana from '../assets/agents/dana.png';
import michal from '../assets/agents/michal.png';
import yoav from '../assets/agents/yoav.png';
import tamar from '../assets/agents/tamar.png';

export const agents = [
  { id: 'roni',  name: 'רוני',  emoji: '♟', role: 'אסטרטגיה', badge: 'STRATEGY',   color: '#3A2418', portrait: roni },
  { id: 'dana',  name: 'דנה',   emoji: '✦', role: 'חוויה',    badge: 'EXPERIENCE', color: '#9B1C5E', portrait: dana },
  { id: 'michal', name: 'מיכל', emoji: '◈', role: 'נתונים',   badge: 'DATA',       color: '#C9521D', portrait: michal },
  { id: 'yoav',  name: 'יואב',  emoji: '◎', role: 'לקוח',     badge: 'CUSTOMER',   color: '#F4A261', portrait: yoav },
  { id: 'tamar', name: 'תמר',  emoji: '⬡', role: 'ביצוע',    badge: 'EXECUTION',  color: '#7B2D26', portrait: tamar },
];

export const slides = [
  {
    type: 'cover',
    big1: 'THE',
    big2: 'VERDICT.',
    subtitle: 'ניתוח רעיונות עסקיים עם 5 סוכנים',
    date: '29.09.2026',
  },
  {
    type: 'brief',
    label: 'THE BRIEF',
    title: 'הרעיון',
    content: 'מכונה שמקבלת בריף עסקי, מריצה מחקר רשת אמיתי ו-5 סוכנים במקביל, ומייצרת מצגת אסטרטגית מלאה תוך 5 דקות. במקום יועץ אחד שאומר "נראה טוב", חמש עיניים רצות במקביל, כל אחת מזווית אחרת, ומתאחדות לפסק דין אחד.',
    footer: '5 PERSPECTIVES · 1 VERDICT · 29.09.2026',
  },
  {
    type: 'process',
    label: 'THE PROCESS',
    title: 'מרוץ הסוכנים',
    subtitle: 'חמש עיניים רצות במקביל, מתאחדות לפסק דין אחד',
    footer: '5 AGENTS RUN IN PARALLEL · WEB RESEARCH FEEDS THEM · ZOHAR SYNTHESIZES',
  },
  {
    type: 'text',
    label: 'MARKET CONTEXT',
    title: 'הקטגוריה והשוק',
    content: 'שוק הייעוץ האסטרטגי מוערך ב-250 מיליארד דולר גלובלית, עם צמיחה שנתית של 7%. בישראל, מאות סטארטאפים משלמים עשרות אלפי שקלים ליועצים חיצוניים כדי לקבל חוות דעת אסטרטגית לפני גיוס. רוב הייעוץ מתמקד בשאלה "האם הרעיון טוב" במקום בשאלה "איך הופכים אותו לקטגוריה שלמה". הפער בשוק: אין כלי שנותן ניתוח רב-פרספקטיבי מיידי, מבוסס מחקר רשת אמיתי, בעלות נמוכה ובזמן אמת.',
    footer: 'WEB RESEARCH · 10+ QUERIES · REAL SOURCES',
  },
  {
    type: 'list',
    label: 'COMPETITOR LANDSCAPE',
    title: 'מתחרים שנמצאו במחקר',
    items: [
      'ChatGPT / Claude: ניתוח חד-סוכני, בלי מחקר רשת מובנה, בלי פורמט מצגת',
      'יועצים אנושיים: עלות 5,000-50,000 ש"ח, זמן שבועות, נקודת מבט אחת',
      'חברות ייעוץ אסטרטגי (McKinsey, BCG): עשרות אלפי דולרים, חודשי עבודה',
      'כלי ניתוח נתונים (Crunchbase, Statista): נתונים בלבד, בלי סינתזה אסטרטגית',
      'תבניות מצגות (Canva, Pitch): עיצוב בלבד, בלי תוכן אסטרטגי',
    ],
    footer: 'EVERY ALTERNATIVE THE CUSTOMER IS ALREADY USING',
  },
  {
    type: 'list',
    label: 'NUMBERS THAT MATTER',
    title: 'מספרים מהמחקר',
    items: [
      'שוק הייעוץ האסטרטגי הגלובלי: 250 מיליארד דולר (2025)',
      'עלות יועץ אסטרטגי בישראל: 5,000-50,000 ש"ח לפרויקט',
      'זמן ניתוח עם Vibe & Verify: 5 דקות',
      'זמן ניתוח עם יועץ: 2-6 שבועות',
      'מספר פרספקטיבות בניתוח: 5 (לעומת 1 בייעוץ רגיל)',
      'חיפושי רשת לכל ניתוח: 10+',
      'שקופיות במצגת הסופית: 38',
    ],
    footer: 'PUBLIC SOURCES + STATED ESTIMATES',
    bullet: '◆',
    bulletColor: 'var(--fuchsia)',
  },
  {
    type: 'two-column',
    label: 'TAILWINDS + HEADWINDS',
    left: {
      title: 'רוח גבית',
      color: 'var(--orange-lt)',
      items: [
        'בשלות AI: מודלי שפה מסוגלים עכשיו לניתוח אסטרטגי אמיתי',
        'תרבות הסטארטאפ: מייסדים מחפשים אימות מהיר לפני השקעה',
        'עלות ייעוץ עולה: הפער בין צורך ליכולת תשלום גדל',
      ],
    },
    right: {
      title: 'אותות אזהרה',
      color: 'var(--burgundy)',
      items: [
        'אמון: מייסדים מסתמכים על אינטואיציה, לא על AI',
        'איכות מחקר: תוצאות חיפוש משתנות, עלול להיות שטחי',
        'תחרות: כלים חינמיים (ChatGPT) נותנים ניתוח בסיסי',
      ],
    },
    footer: 'WHAT PUSHES US FORWARD AND WHAT MIGHT STOP US',
  },
  {
    type: 'dark-hero',
    label: 'WHY NOW',
    big1: 'WHY',
    big2: 'NOW.',
    content: 'בשלות מודלי השפה הגיעה לנקודה שבה ניתוח אסטרטגי רב-פרספקטיבי אפשרי. עלות ה-API ירדה ב-90% בשנתיים האחרונות. מייסדים רגילים לקבל תשובות מיידיות מ-AI, והציפייה לניתוח מהיר גדלה. במקביל, שוק הייעוץ נשאר יקר ואיטי. החלון הזה לא יישאר פתוח לנצח.',
    footer: 'RESEARCH SYNTHESIS',
  },
  {
    type: 'team',
    label: 'THE 5 AGENTS',
    title: 'חמש עיניים. פסק דין אחד.',
    footer: '◆ CONDUCTED BY ZOHAR URIAN · TRIPLE IMPACT FRAMEWORK',
  },
  {
    type: 'agent-grid',
    label: 'THE RACE, ALL 5 CONVERGED',
    title: 'מה כל סוכן הוסיף',
    insights: {
      roni: 'ההנחה הכי מסוכנת היא שמייסדים ישלמו על ניתוח שהם יכולים לקבל חינם מ-ChatGPT',
      dana: 'הרגש ביום הראשון הוא "וואו", אבל בחודש השלישי זה הופך ל"עוד כלי שלא פתחתי"',
      michal: 'TAM של 250 מיליארד דולר נשמע מרשים, אבל SOM של 0.01% הוא 25 מיליון, וזה עדיין שאפתני',
      yoav: 'נשמע מעניין, אבל אני כבר משתמש ב-ChatGPT לדברים כאלה. למה אני צריך עוד כלי?',
      tamar: 'המרחק בין "מצגת יפה" ל"החלטה אמיתית" הוא המקום שהמוצר הזה יחיה או ימות',
    },
    footer: 'PARALLEL ANALYSIS · ZOHAR SYNTHESIZES',
  },
  {
    type: 'verdict',
    big: 'VERDICT.',
    content: 'מה זה באמת: לא כלי ניתוח, אלא תשתית קבלת החלטות. המתחרה האמיתי לא ChatGPT, אלא האינטואיציה של המייסד.',
    category: 'הקטגוריה שאנחנו מנכסים',
    categoryContent: 'ניתוח אסטרטגי רב-פרספקטיבי מיידי',
    footer: '◆ ZOHAR URIAN',
  },
  {
    type: 'move',
    label: 'THE MOVE',
    big1: 'THE',
    big2: 'PIVOT.',
    content: 'לא למכור "מצגת אסטרטגית". למכור "ודאות לפני ששופכים כסף". המצגת היא האריזה, לא המוצר. המוצר הוא ההחלטה שהמייסד מקבל אחרי הקריאה. לכן, למדוד לא "כמה מצגות יצרנו" אלא "כמה החלטות שונו".',
    footer: 'ONE ACTION THAT MOVES EVERYTHING ELSE',
  },
  {
    type: 'test',
    label: 'THE 90-DAY TEST',
    big: '90',
    unit: 'DAYS',
    title: 'המבחן היחיד',
    content: '50 מייסדים שמשתמשים בכלי פעם נוספת תוך 30 יום מהשימוש הראשון. לא הרשמה, לא הורדה. שימוש חוזר. זה המספר היחיד שמוכיח שהניתוח שינה משהו.',
    footer: 'ONE NUMBER. EVERYTHING ELSE IS DECORATION.',
  },
  {
    type: 'next-moves',
    label: 'NEXT MOVES',
    title1: 'THIS WEEK.',
    title2: 'THIS MONTH.',
    columns: [
      { label: 'DAYS 1-7',  color: 'var(--brown)',     content: 'שוחח עם 20 מייסדים, תעדכן את המסר מ"ניתוח" ל"ודאות"' },
      { label: 'DAYS 8-30', color: 'var(--orange-dk)', content: 'בנה תהליך onboarding שמסיים בהחלטה, לא במצגת' },
      { label: 'MONTH 3',   color: 'var(--fuchsia)',   content: '50 מייסדים פעילים חוזרים, עם NPS מעל 40' },
    ],
    footer: 'THE WORK STARTS MONDAY',
  },
  {
    type: 'endcap',
    big1: 'VIBE',
    big2: '&',
    big3: 'VERIFY.',
    footer: '◆ ZOHAR URIAN · 29.09.2026 · VIBE & VERIFY',
  },
];
