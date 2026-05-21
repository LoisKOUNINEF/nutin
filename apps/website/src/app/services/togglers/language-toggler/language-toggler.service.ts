import { Language } from '../../../../core/services/i18n/languages.js';
import { I18nService, Service } from '../../../../core/index.js';
import { notify } from '../../../../libs/index.js';

export class LanguageToggler extends Service<LanguageToggler> {  
  public async toggleLang(): Promise<void> {
    const switchTo = I18nService.currentLanguage === 'en' ? 'fr' : 'en';
    await I18nService.setCurrentLanguage(switchTo);
    this.notifyChange();
  }

  private notifyChange() {
    const messages: Record<Language, string> = {
      fr: 'Langue: Français',
      en: 'Language: English'
    };
    const currentLang = I18nService.currentLanguage;
    const message = messages[currentLang] || messages['fr'];
    notify(message!);
  }

}

export const LanguageTogglerService = LanguageToggler.getInstance();
