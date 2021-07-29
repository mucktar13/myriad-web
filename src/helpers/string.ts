import {SyntheticEvent} from 'react';

export const acronym = (value: string): string => {
  if (!value) return '';
  return value.split(/\s/).reduce((response, word) => (response += word.slice(0, 1)), '');
};

export const capitalize = (text: string): string => {
  const word = text.toLowerCase();

  return word[0].toUpperCase() + word.substring(1);
};

export const parseHashtag = (
  value: string,
  hashtagRenderer: any,
  urlRenderer: any,
  action: (e: SyntheticEvent, hashtag: string) => void,
): string[] => {
  const hashtagRule = /([#|＃][^\s]+)/g;
  const urlRule =
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g;

  return value.split(hashtagRule).map((chunk: string) => {
    if (chunk.match(hashtagRule)) {
      return hashtagRenderer(chunk, action);
    }

    return chunk.split(urlRule).map(text => {
      if (text.match(urlRule)) {
        return urlRenderer(text);
      }

      return text;
    });
  });
};
