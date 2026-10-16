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
        <li><Node>Kuyruk: en üstteki olay</Node></li>
        <li><Node>Olay: neden + son süre</Node></li>
        <li><Node tone="lime">Önerilen sonraki adım</Node></li>
        <li><Node tone="ink">Satır içi onay</Node></li>
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
          <li><Node tone="lime">Sıradaki adım: saha ziyareti iste</Node></li>
          <li><Node tone="ink">Talebi onayla</Node></li>
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
          <li className="fd__return"><span className="fd__return-in"><Icon name="ret" size={12} strokeWidth={1.8} /> Olay kapandı’ya döner</span></li>
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
            <p className="cs__proof">Tek bir sıralı kuyruk ve tek bir sonraki adım üzerine kurulu bir operasyon konsolu konsepti.</p>
            <p className="cs__meta">
              Product Designer (bağımsız konsept)<span aria-hidden="true"> · </span>Delivery One<span aria-hidden="true"> · </span>Otonom teslimat<span aria-hidden="true"> · </span>Konsept<span aria-hidden="true"> · </span>2026
            </p>
            <p className="cs__note">
              Bu bağımsız bir konsept çalışmasıdır. Bağlam için Delivery One’ın herkese açık web stilini kullanır, ancak Delivery One ile
              bağlantılı değildir ve onayını taşımaz. Tüm veriler temsilîdir.
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
              <li>Uzaktan müdahale işe yaramazsa saha ekibinin, müşteriyle yapılan sözleşmedeki süre içinde gelmesi gerekiyor.</li>
              <li>Bu sinyallerin vardiyadaki kişi için nasıl karara dönüştüğünü gösteren, kamuya açık hiçbir şey yok.</li>
              <li>Hedef üç soruyu yanıtlayan konsolu tasarlamaktı: Şu an neye bakmalıyım, bu neden önemli, ne yapabilirim?</li>
            </ul>
            <figure className="cs__figure">
              <img
                src={IMG('hero-queue.webp')}
                width={1440}
                height={900}
                alt="Konsolun açılış ekranı: solda öncelik sırasına göre olay kuyruğu, sağda açık olan en üstteki olay INC-101."
              />
              <figcaption>Açılıştaki kuyruk. En üstteki satır neden ilk sırada olduğunu söylüyor, panel ise tek bir sonraki adım öneriyor.</figcaption>
            </figure>
          </section>

          <section className="cs__sec" aria-labelledby="cs-did">
            <h2 id="cs-did">Ne yaptım</h2>
            <ul>
              <li>
                Delivery One’ın açıkça söylediklerini, benim varsaymak zorunda kaldıklarımdan ayırdım. Ortaya 10 hipotez ve şirkete sorulacak 8
                soru çıktı.
              </li>
              <li>Tek bir ekran çizmeden önce durumları, aksiyonları ve yazılı bir öncelik kuralını modelledim.</li>
              <li>Delivery One’ın renklerini ve tipografisini bir gece vardiyasına ve WCAG AA kontrast standardına göre uyarladım.</li>
              <li>
                Çalışan bir prototip kurdum. Ardından onu tasarım kritiği, sıralı tasarım turları ve 10 senaryoluk bir deneme ile geliştirdim. Bu
                süreç boyunca otomatik kontroller ürünün davranışını sabit tuttu.
              </li>
            </ul>
          </section>

          <section className="cs__sec" aria-labelledby="cs-decisions">
            <h2 id="cs-decisions">Üç karar</h2>
            <div className="cs__decision">
              <h3>Bekleyen insan, kaçmış süreden önce gelir.</h3>
              <p>Teslim kapağında bekleyen bir alıcı 10 dakika boyunca listenin en üstünde kalır. Sonra sıralama yeniden son süreye göre işler.</p>
            </div>
            <div className="cs__decision">
              <h3>Okunabilen kurallarla sırala.</h3>
              <p>Gizli bir puan yok, her satır kendi gerekçesini yazıyor. İlk kritik, yazılı kuralın gerçek sırayla çeliştiğini yakaladı. Bunu düzelttim.</p>
            </div>
            <div className="cs__decision">
              <h3>Bilinmeyen, sağlıklı değildir.</h3>
              <p>Sinyali kesilen bir istasyon gri, kesik çizgili ve son veri saatiyle gösterilir. Hiçbir zaman sorunsuz görünmez.</p>
            </div>
            <figure className="cs__figure">
              <FlowDiagram />
              <figcaption>
                Operatör akışı: En üstteki olayı aç, önerilen adımı çalıştır, onayla, sonucu gör. Adım başarısız olursa sıradaki adım saha
                ziyareti olur.
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
                Tek bir karar kartı. Olayın neden bu sırada olduğunu, sözleşmeye göre kalan süreyi, önerilen adımı ve tespitten kapanışa uzanan adım
                çubuğunu gösteriyor.
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
                Başarısız bir uzaktan müdahale, takip edilebilen bir saha görevine dönüşür. Kapanan olay ise operatörü doğrudan sıradakine götürür.
              </figcaption>
            </figure>
            <p className="cs__after">
              <a className="cs__tlink" href={CONSOLE}>Canlı prototipi aç →</a>
            </p>
          </section>

          <section className="cs__sec" aria-labelledby="cs-handoff">
            <h2 id="cs-handoff">Mühendislere devir</h2>
            <ul>
              <li>Prototipi ürüne taşıyacak ekip için adım adım bir devir dokümanı yazdım.</li>
              <li>Neyin gerçek (ekranlar, kurallar, davranış), neyin taklit (veri, saat, sonuçlar) olduğunu ayırdım.</li>
              <li>Hiçbir değişiklikte bozulmaması gereken 9 kuralı ve geliştirmeye başlamadan Delivery One’a sorulacak 6 soruyu listeledim.</li>
              <li>Her adım için kopyalanıp kullanılabilecek bir prompt ve bir bitti tanımı ekledim. Otomatik kontroller her değişiklikte aynı davranışı doğrular.</li>
            </ul>
            <a className="cs__tlink" href={`${REPO}/blob/main/HANDOFF.md`}>Devir dokümanını oku →</a>
          </section>

          <section className="cs__sec" aria-labelledby="cs-now">
            <h2 id="cs-now">Şu an nerede</h2>
            <p>
              Bu çalışma, Delivery One’ın katılımı olmadan hazırlanmış bağımsız bir konsept. İstasyonlar, paketler ve hedef süreler temsilî,
              kullanılabilirlik testi de yapılmadı. Daha ileri gitmeden önce Delivery One’a şunları sorardım: İstasyonları kim izliyor, gerçekte
              hangi olaylar yaşanıyor, bunları nasıl önceliklendiriyorlar ve paketlerin bir bekleme süresi var mı?
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
