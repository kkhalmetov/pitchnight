import type { Locale } from "@/lib/tynys/i18n/types";

export const LANDING_FACTS = [
  {
    id: "schools",
    value: "302",
    year: "2025–2026",
    sourceUrl:
      "https://www.gov.kz/memleket/entities/shymkent/activities/1846",
  },
  {
    id: "students",
    value: "276 466",
    year: "2025–2026",
    sourceUrl:
      "https://www.gov.kz/memleket/entities/shymkent/activities/1846",
  },
  {
    id: "heat",
    value: "43,7 °C",
    year: "2025",
    sourceUrl: "https://www.kazhydromet.kz/ru/uinfos/9",
  },
  {
    id: "emissions",
    value: "28,8",
    year: "2025",
    sourceUrl:
      "https://stat.gov.kz/ru/industries/environment/stat-eco/publications/346639/",
  },
] as const;

export type LandingFactId = (typeof LANDING_FACTS)[number]["id"];

interface FactCopy {
  label: string;
  note: string;
  source: string;
  valueSuffix?: string;
}

export interface MektepDictionary {
  shell: {
    skipLink: string;
    brandHomeLabel: string;
    context: string;
    contextStrong: string;
    footerStatement: string;
    riskLegendTitle: string;
  };
  hero: {
    overline: string;
    title: string;
    lead: string;
    cta: string;
    premiseLabel: string;
    productLabel: string;
    signalTitle: string;
    signalNote: string;
    modelTitle: string;
    modelNote: string;
    decisionTitle: string;
    decisionNote: string;
    flowAriaLabel: string;
  };
  evidence: {
    overline: string;
    title: string;
    intro: string;
    sourceLabel: string;
    sourceAriaPrefix: string;
    items: Record<LandingFactId, FactCopy>;
  };
  demo: {
    overline: string;
    title: string;
    intro: string;
    stepsAriaLabel: string;
    steps: ReadonlyArray<{
      number: string;
      title: string;
      note: string;
    }>;
    note: string;
  };
}

const dictionaries: Record<Locale, MektepDictionary> = {
  kk: {
    shell: {
      skipLink: "Негізгі мазмұнға өту",
      brandHomeLabel: "TYNYS Mektep — басты бет",
      context: "Білім беру ортасына арналған",
      contextStrong: "климаттық шешімдер жүйесі",
      footerStatement: "Дерек көрінеді. Шешім түсіндіріледі.",
      riskLegendTitle: "Индекс деңгейлері",
    },
    hero: {
      overline: "TYNYS платформасының алғашқы өнімі",
      title: "Мектеп кестесі ауа райын да ескеруі тиіс.",
      lead:
        "TYNYS Mektep ашық климаттық деректерді оқу кестесімен байланыстырып, күннің қауіпсіздеу уақытын түсінікті түрде көрсетеді.",
      cta: "Мектеп күнін тексеру",
      premiseLabel: "Өнім гипотезасы",
      productLabel: "TYNYS Mektep",
      signalTitle: "Орта сигналы",
      signalNote: "жылу · ультракүлгін · ауа",
      modelTitle: "Ашық индекс",
      modelNote: "бірдей ереже · көрінетін себеп",
      decisionTitle: "Кесте шешімі",
      decisionNote: "уақытты ауыстыру · үзілісті бейімдеу",
      flowAriaLabel:
        "Климаттық сигналдан мектеп кестесі шешіміне дейінгі TYNYS моделі",
    },
    evidence: {
      overline: "Шымкент · ашық деректер",
      title: "Мәселенің ауқымы ресми деректе көрінеді.",
      intro:
        "Бұл сандар сұранысты дәлелдемейді. Олар MVP тексеретін нақты жергілікті контексті көрсетеді.",
      sourceLabel: "Дереккөз",
      sourceAriaPrefix: "Ресми дереккөзді ашу:",
      items: {
        schools: {
          label: "мектеп",
          note: "Шымкент қаласындағы жалпы білім беру ұйымдары",
          source: "Шымкент қаласының білім басқармасы",
        },
        students: {
          label: "оқушы",
          note: "қала мектептеріндегі оқушылар саны",
          source: "Шымкент қаласының білім басқармасы",
        },
        heat: {
          label: "шілдедегі абсолюттік максимум",
          note: "Шымкентте тіркелген ауа температурасы",
          source: "Қазгидромет",
        },
        emissions: {
          label: "стационарлық шығарындылар",
          note: "Шымкенттегі ластаушы заттардың жылдық көлемі",
          source: "ҚР Ұлттық статистика бюросы",
          valueSuffix: "мың т",
        },
      },
    },
    demo: {
      overline: "MVP логикасы",
      title: "Бір күн. Үш түсінікті қадам.",
      intro:
        "TYNYS Mektep шешімді жасырмайды: қандай дерек әсер еткенін және кестеде нені өзгертуге болатынын көрсетеді.",
      stepsAriaLabel: "TYNYS Mektep жұмыс істеу реті",
      steps: [
        {
          number: "01",
          title: "Күнді таңдаңыз",
          note: "Оқу күні мен негізгі уақыт аралығын белгілеңіз.",
        },
        {
          number: "02",
          title: "Сигналдарды салыстырыңыз",
          note: "Жылу, ультракүлгін және ауа жағдайын бір шкалада көріңіз.",
        },
        {
          number: "03",
          title: "Кестені бейімдеңіз",
          note: "Сыртқы белсенділік үшін қолайлырақ уақыт терезесін табыңыз.",
        },
      ],
      note:
        "MVP ашық деректерге сүйенеді және медициналық қорытынды бермейді.",
    },
  },
  ru: {
    shell: {
      skipLink: "Перейти к основному содержанию",
      brandHomeLabel: "TYNYS Mektep — главная",
      context: "Климатические решения",
      contextStrong: "для образовательной среды",
      footerStatement: "Данные видны. Решение объяснимо.",
      riskLegendTitle: "Уровни индекса",
    },
    hero: {
      overline: "Первый продукт платформы TYNYS",
      title: "Школьное расписание должно учитывать и погоду.",
      lead:
        "TYNYS Mektep связывает открытые климатические данные с расписанием и понятно показывает более безопасные интервалы учебного дня.",
      cta: "Проверить школьный день",
      premiseLabel: "Гипотеза продукта",
      productLabel: "TYNYS Mektep",
      signalTitle: "Сигнал среды",
      signalNote: "жара · ультрафиолет · воздух",
      modelTitle: "Открытый индекс",
      modelNote: "единое правило · видимая причина",
      decisionTitle: "Решение для расписания",
      decisionNote: "сменить время · адаптировать перемену",
      flowAriaLabel:
        "Модель TYNYS от климатического сигнала до решения для школьного расписания",
    },
    evidence: {
      overline: "Шымкент · открытые данные",
      title: "Масштаб задачи виден в официальных данных.",
      intro:
        "Эти цифры не доказывают спрос. Они задают конкретный местный контекст, который проверяет MVP.",
      sourceLabel: "Источник",
      sourceAriaPrefix: "Открыть официальный источник:",
      items: {
        schools: {
          label: "школы",
          note: "общеобразовательные организации города Шымкента",
          source: "Управление образования города Шымкента",
        },
        students: {
          label: "учащихся",
          note: "число учеников в школах города",
          source: "Управление образования города Шымкента",
        },
        heat: {
          label: "абсолютный максимум июля",
          note: "зарегистрированная температура воздуха в Шымкенте",
          source: "Казгидромет",
        },
        emissions: {
          label: "стационарных выбросов",
          note: "годовой объём загрязняющих веществ в Шымкенте",
          source: "Бюро национальной статистики РК",
          valueSuffix: "тыс. т",
        },
      },
    },
    demo: {
      overline: "Логика MVP",
      title: "Один день. Три понятных шага.",
      intro:
        "TYNYS Mektep не прячет решение: показывает, какие данные повлияли на оценку и что можно изменить в расписании.",
      stepsAriaLabel: "Как работает TYNYS Mektep",
      steps: [
        {
          number: "01",
          title: "Выберите день",
          note: "Укажите учебный день и основной временной интервал.",
        },
        {
          number: "02",
          title: "Сравните сигналы",
          note: "Посмотрите жару, ультрафиолет и состояние воздуха на одной шкале.",
        },
        {
          number: "03",
          title: "Адаптируйте расписание",
          note: "Найдите более подходящее окно для активности на улице.",
        },
      ],
      note:
        "MVP опирается на открытые данные и не даёт медицинских заключений.",
    },
  },
};

export function getMektepDictionary(locale: Locale): MektepDictionary {
  return dictionaries[locale];
}
