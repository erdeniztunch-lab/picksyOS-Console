import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from './Icon';
import '../styles/case.css';

const IMG = (f: string) => `${import.meta.env.BASE_URL}case-study/${f}`;
const REPO = 'https://github.com/erdeniztunch-lab/picksyOS-Console';
const FAQ = 'https://www.delivery-one.com/en/faq'; // S2 in evidence.md
const CONSOLE = '#/queue';

/** One node of the operator flow, drawn in the console's own visual language. */
function Node({ tone = 'plain', children }: { tone?: 'plain' | 'lime' | 'ink' | 'info' | 'ok'; children: ReactNode }) {
  return <span className={`fd__node fd__node--${tone}`}>{children}</span>;
}

/**
 * The operator flow from product-brief.md (primary flow + secondary flow A), as HTML so it stays
 * sharp, readable at every width and accessible. Stage labels match the build exactly.
 */
function FlowDiagram() {
  return (
    <div className="fd" data-theme="light">
      <ol className="fd__rail" aria-label="Ana akış">
        <li><Node>Kuyrukta en üstteki olay</Node></li>
        <li><Node>Neden önde, ne kadar süre var</Node></li>
        <li><Node tone="lime">Önerilen sonraki adım</Node></li>
        <li><Node tone="ink">Ne olacağını oku, onayla</Node></li>
        <li><Node tone="info">İşlem sürüyor</Node></li>
        <li className="fd__decision-wrap">
          <span className="fd__decision" aria-label="Sonuç: dallanma noktası">
            <span>Sonuç</span>
          </span>
        </li>
      </ol>
      <div className="fd__branches">
        <ol className="fd__branch fd__branch--ok" aria-label="Sonuç başarılı">
          <li className="fd__label fd__label--ok"><Icon name="check" size={12} strokeWidth={2} /> başarılı</li>
          <li><Node tone="ok">Olay kapandı</Node></li>
          <li><Node>Sıradaki olay →</Node></li>
        </ol>
        <ol className="fd__branch fd__branch--fail" aria-label="Sonuç başarısız">
          <li className="fd__label fd__label--fail"><Icon name="x" size={12} strokeWidth={1.8} /> başarısız</li>
          <li><Node tone="lime">Yeni öneri: saha ziyareti iste</Node></li>
          <li><Node tone="ink">Talebi gözden geçir, gönder</Node></li>
          <li>
            <span className="fd__node fd__node--info fd__node--task">
              <span>Saha görevi</span>
              <span className="fd__stages">
                {['Talep edildi', 'Kabul edildi', 'Sahada', 'Tamamlandı'].map((s, i) => (
                  <span key={s}>
                    {i > 0 && <span aria-hidden="true"> · </span>}
                    <span className="fd__stage">{s}</span>
                  </span>
                ))}
              </span>
            </span>
          </li>
          <li className="fd__return"><span className="fd__return-in"><Icon name="ret" size={12} strokeWidth={1.8} /> Görev tamamlanınca olay kapanır</span></li>
        </ol>
      </div>
    </div>
  );
}

/** The case study: the first screen a visitor sees, before the console. */
export function CaseStudy() {
  const h1 = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const prev = document.title;
    document.title = 'İstasyon uyarılarını karara dönüştürmek · PicksyOS';
    window.scrollTo(0, 0);
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <div className="cs" data-theme="light">
      <a className="cs__skip" href="#cs-main" onClick={(ev) => { ev.preventDefault(); h1.current?.focus(); }}>
        İçeriğe geç
      </a>
      <header className="cs__nav">
        <div className="cs__nav-in">
          <a className="cs__brand" href="https://erdeniztunc.com">Erdeniz Tunç</a>
          <a className="cs__btn cs__btn--ink" href={CONSOLE}>Konsolu aç</a>
        </div>
      </header>

      <main id="cs-main" className="cs__main">
        <article className="cs__wrap">
          <header className="cs__header">
            <a className="cs__back" href="https://erdeniztunc.com/work">← Tüm çalışmalar</a>
            <h1 ref={h1} tabIndex={-1} className="cs__title">İstasyon uyarılarını karara dönüştürmek</h1>
            <p className="cs__proof">Paket istasyonlarını uzaktan izleyen operatörler için bir konsol konsepti: olaylar tek bir kuyrukta sıralanır, her olay bir sonraki adımı önerir.</p>
            <p className="cs__meta">
              Product Designer<span aria-hidden="true"> · </span>Delivery One<span aria-hidden="true"> · </span>Otonom teslimat<span aria-hidden="true"> · </span>Bağımsız konsept<span aria-hidden="true"> · </span>2026
            </p>
            <p className="cs__note">
              Bağımsız bir konsept çalışmasıdır. Bağlam kurmak için Delivery One’ın web sitesindeki renkleri ve yazı tiplerini kullanır;
              Delivery One ile bağlantılı değildir, onayını da taşımaz. Tüm veriler temsilîdir.
            </p>
            <a className="cs__tlink" href={CONSOLE}>Canlı prototipi aç →</a>
          </header>

          <section className="cs__sec" aria-labelledby="cs-problem">
            <h2 id="cs-problem">Problem</h2>
            <ul>
              <li>
                Delivery One, her paket istasyonunun <a href={FAQ}>7/24 uzaktan izlendiğini</a> ve sorunların çoğunun uzaktan çözüldüğünü
                söylüyor.
              </li>
              <li>Uzaktan çözülemeyen bir sorunda saha ekibinin, müşteriyle sözleşmede belirlenen süre içinde gelmesi gerekiyor.</li>
              <li>Bu sinyallerin vardiyadaki operatörün önünde nasıl bir karara dönüştüğü ise kamuya açık hiçbir kaynakta anlatılmıyor.</li>
              <li>Amacım, operatörün üç sorusuna cevap veren bir konsol tasarlamaktı: şu an neye bakmalıyım, bu neden önemli, ne yapabilirim?</li>
            </ul>
            <figure className="cs__figure">
              <img
                src={IMG('hero-queue.webp')}
                width={1440}
                height={900}
                alt="Konsolun açılış ekranı: solda öncelik sırasına göre olay kuyruğu, sağda açık olan en üstteki olay INC-101."
              />
              <figcaption>Açılış ekranı. En üstteki satır neden ilk sırada olduğunu kendisi söylüyor; sağdaki panel bir sonraki adımı öneriyor.</figcaption>
            </figure>
          </section>

          <section className="cs__sec" aria-labelledby="cs-did">
            <h2 id="cs-did">Ne yaptım</h2>
            <ul>
              <li>
                Delivery One’ın açıkça söylediklerini, varsaymak zorunda kaldığım şeylerden ayırdım. Bundan 10 hipotez ve şirkete sorulacak 8 soru
                çıktı.
              </li>
              <li>Ekran çizmeye başlamadan önce olayın alabileceği durumları, aksiyonları ve yazılı bir öncelik kuralını modelledim.</li>
              <li>Delivery One’ın renklerini ve tipografisini, gece vardiyasında saatlerce bakılacak bir ekrana uyarladım; kontrastı WCAG AA’ya göre ayarladım.</li>
              <li>
                Çalışan bir prototip kurdum, sonra tasarım kritiği, art arda tasarım turları ve hedef kullanıcı gözüyle oynanan 10 senaryoyla
                geliştirdim. Bu sırada otomatik kontroller, görsel değişikliklerin davranışı bozmadığını doğruladı.
              </li>
            </ul>
          </section>

          <section className="cs__sec" aria-labelledby="cs-decisions">
            <h2 id="cs-decisions">Üç karar</h2>
            <div className="cs__decision">
              <h3>Kapakta bekleyen alıcı, süresi geçmiş olaydan önce gelir.</h3>
              <p>Teslim kapağının önünde bekleyen bir alıcı varsa olay 10 dakika boyunca listenin en üstünde kalır, sonra sıralama yeniden son süreye döner. Süresi zaten geçmiş bir olay birkaç dakika bekleyebilir; kapaktaki kişi bekleyemez.</p>
            </div>
            <div className="cs__decision">
              <h3>Sıralamayı yazılı bir kural belirler.</h3>
              <p>Gizli bir risk puanı yok; her satır neden o sırada olduğunu yazıyor. İlk tasarım kritiğinde kuralın metninin ekrandaki sırayla çeliştiği ortaya çıktı: metin, kapakta bekleyen alıcıyı hiç anmıyordu. Metni, kodun gerçekte yaptığıyla aynı olacak şekilde düzelttim.</p>
            </div>
            <div className="cs__decision">
              <h3>Haber alınamayan istasyon sağlıklı sayılmaz.</h3>
              <p>Sinyali gecikmiş ya da kesilmiş bir istasyon gri, kesik çizgili ve son verinin saatiyle gösterilir; sorunsuz bir istasyon gibi görünmez.</p>
            </div>
            <figure className="cs__figure">
              <FlowDiagram />
              <figcaption>
                Operatör akışı: en üstteki olayı aç, önerilen adımı çalıştır, onayla, sonucu gör. Uzaktan çözüm tutmazsa öneri saha ziyaretine
                döner.
              </figcaption>
            </figure>
          </section>

          <section className="cs__sec" aria-labelledby="cs-console">
            <h2 id="cs-console">Konsol</h2>
            <figure className="cs__figure">
              <img
                src={IMG('incident-panel.webp')}
                width={832}
                height={590}
                loading="lazy"
                alt="INC-101 karar kartı: Tespit'ten Kapandı'ya adım çubuğu, Neden P1 gerekçeleri, son süre çubuğu ve önerilen adım Teslimi yeniden dene."
              />
              <figcaption>
                Karar kartı. Olayın neden bu sırada olduğu, sözleşmeye göre kalan süre, önerilen adım ve olayın tespitten kapanışa kadar hangi
                aşamada olduğu aynı kartta.
              </figcaption>
            </figure>
            <figure className="cs__figure">
              <div className="cs__pair">
                <img
                  src={IMG('field-task.webp')}
                  width={782}
                  height={372}
                  loading="lazy"
                  alt="Saha görevi FT-032, Kabul edildi aşamasında: aşama çizgisi, aşılmış son süre ve iptal seçeneği."
                />
                <img
                  src={IMG('done-card.webp')}
                  width={782}
                  height={197}
                  loading="lazy"
                  alt="Olay kapandı kartı: sonuç, süre, kapatan ve Sıradaki olay: P1 INC-102 düğmesi."
                />
              </div>
              <figcaption>
                Uzaktan müdahale tutmazsa iş, aşamaları izlenebilen bir saha görevine dönüşür. Olay kapandığında kart, sıradaki olayı gösterir.
              </figcaption>
            </figure>
            <p className="cs__after">
              <a className="cs__tlink" href={CONSOLE}>Canlı prototipi aç →</a>
            </p>
          </section>

          <section className="cs__sec" aria-labelledby="cs-handoff">
            <h2 id="cs-handoff">Mühendislere devir</h2>
            <ul>
              <li>Prototipi gerçek ürüne taşıyacak mühendisler için adım adım bir devir dokümanı hazırladım.</li>
              <li>Dokümanın başında neyin kalacağı (ekranlar, kurallar, davranış) ve neyin değişeceği (örnek veri, demo saati, senaryolu sonuçlar) ayrı ayrı yazıyor.</li>
              <li>Hangi değişiklik yapılırsa yapılsın korunması gereken 9 kuralı ve geliştirmeye başlamadan önce Delivery One’dan cevap alınması gereken 6 soruyu listeledim.</li>
              <li>Her adımın yanında, kodlama asistanına olduğu gibi verilebilecek bir prompt ve adımın ne zaman bitmiş sayılacağı var. Mevcut otomatik kontroller, her değişiklikte davranışın aynı kaldığını doğruluyor.</li>
            </ul>
            <a className="cs__tlink" href={`${REPO}/blob/main/HANDOFF.md`}>Devir dokümanını oku →</a>
          </section>

          <section className="cs__sec" aria-labelledby="cs-now">
            <h2 id="cs-now">Şu an nerede</h2>
            <p>
              Bu çalışmayı Delivery One’ın katılımı olmadan, bağımsız bir konsept olarak hazırladım. İstasyonlar, paketler ve hedef süreler
              temsilî; kullanılabilirlik testi yapmadım. Devam etmeden önce Delivery One’a şunları sorardım: istasyonları kim izliyor, en sık hangi
              olaylar yaşanıyor, bunları nasıl önceliklendiriyorlar ve paketlerin istasyonda bekleme süresi var mı?
            </p>
          </section>

          <div className="cs__cta">
            <a className="cs__btn cs__btn--primary cs__btn--lg" href={CONSOLE}>Konsolu aç →</a>
            <a className="cs__tlink" href={REPO}>Kaynak kod ve dokümanlar →</a>
          </div>
          <a className="cs__tlink cs__all" href="https://erdeniztunc.com/work">Tüm çalışmalar →</a>
        </article>
      </main>
    </div>
  );
}
