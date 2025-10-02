import { DEFAULT_SOURCE_LANGUAGE_CODE } from "@/constants";
import {
  ParsedTranslation,
  PhraseTranslation,
  SingleWordTranslation,
} from "@/types/";
import { isPhraseTranslation, isSingleWordTranslation } from "@/utils/";
import { useEffect, useState } from "react";
import { PhraseTranslationRenderer } from "./PhraseTranslationRenderer";
import { SingleWordTranslationRenderer } from "./SingleWordTranslationRenderer";

interface DictionaryRendererProps {
  translation: ParsedTranslation;
  isHistoryDetailView?: boolean;
}
export function DictionaryRenderer({
  translation,
  isHistoryDetailView = false,
}: DictionaryRendererProps) {
  const [sourceLangCodeSetting, setSourceLangCodeSetting] = useState<string>(
    DEFAULT_SOURCE_LANGUAGE_CODE,
  );

  // Load source language code from Chrome storage
  useEffect(() => {
    chrome.storage.sync.get("sourceLangCode", (data) => {
      if (data.sourceLangCode) {
        setSourceLangCodeSetting(data.sourceLangCode);
      }
    });
  }, []);

  if (isPhraseTranslation(translation)) {
    return (
      <PhraseTranslationRenderer
        phraseTranslation={translation as PhraseTranslation}
        sourceLangCodeSetting={sourceLangCodeSetting}
        isHistoryDetailView={isHistoryDetailView}
      />
    );
  }

  if (isSingleWordTranslation(translation)) {
    return (
      <SingleWordTranslationRenderer
        singleWordTranslation={translation as SingleWordTranslation}
        sourceLangCodeSetting={sourceLangCodeSetting}
        isHistoryDetailView={isHistoryDetailView}
      />
    );
  }

  // Fallback for unknown format
  return (
    <div className="dictionary-content">
      <div className="text-gray-600">
        <pre className="whitespace-pre-wrap">
          {JSON.stringify(translation, null, 2)}
        </pre>
      </div>
    </div>
  );
}
