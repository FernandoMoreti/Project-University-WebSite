"use client"

import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Users, Globe2, Clock, Coins, Languages, CloudSun, BookOpen } from "lucide-react";

interface CountryData {
  name: string;
  flag: string;
  coatOfArms: string;
  population: string;
  region: string;
  capital: string;
  subregion: string;
  languages: string;
  currencies: string;
  timezones: string;
  borders: string[];
  latlng: [number, number];
}

interface WeatherData {
  temp: number;
  wind: number;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState<CountryData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [wiki, setWiki] = useState("");

  async function fetchAllData() {
    if (!query.trim()) return;
    setLoading(true);
    setCountry(null);
    setWeather(null);
    setWiki("");

    try {
      axios.get(`https://api.unsplash.com/search/photos`, {
        params: { query, client_id: '4QkdwBc0w_6udHPL4KpW8AK_KAbZmCIuqQc0ruiZHHo', orientation: 'landscape', per_page: 1 }
      }).then(res => {
        if (res.data.results.length > 0) setImage(res.data.results[0].urls.regular);
      }).catch(() => {});

      const countryRes = await axios.get(`https://restcountries.com/v3.1/translation/${query}`);
      const c = countryRes.data[0];

      const lat = c.latlng[0];
      const lon = c.latlng[1];
      const countryNamePT = c.translations.por.common;

      setCountry({
        name: countryNamePT,
        flag: c.flags.svg,
        coatOfArms: c.coatOfArms?.svg || "",
        population: c.population.toLocaleString('pt-BR'),
        region: c.region,
        capital: c.capital?.[0] || 'N/A',
        subregion: c.subregion || 'N/A',
        languages: c.languages ? Object.values(c.languages).join(", ") : "N/A",
        currencies: c.currencies ? Object.values(c.currencies).map((curr: any) => `${curr.name} (${curr.symbol})`).join(", ") : "N/A",
        timezones: c.timezones[0],
        borders: c.borders || [],
        latlng: [lat, lon]
      });

      axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
        .then(res => {
          setWeather({
            temp: res.data.current_weather.temperature,
            wind: res.data.current_weather.windspeed
          });
        }).catch(() => {});

      axios.get(`https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(countryNamePT)}`)
        .then(res => {
          setWiki(res.data.extract);
        }).catch(() => setWiki("Resumo histórico não disponível para esta localidade."));

    } catch (e) {
      console.error("Erro geral:", e);
      alert("Destino não encontrado. Tente um nome de país válido.");
    } finally {
      setLoading(false);
    }
  }

  // Configuração de animação do grid (Stagger)
  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center p-4 md:p-10 overflow-hidden font-sans">

      <div className="fixed inset-0 bg-black -z-20" />

      <AnimatePresence>
        {(image || "https://images.unsplash.com/photo-1451187580459-43490279c0fa") && (
          <motion.img
            key={image || "fallback"}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.4, scale: 1 }}
            transition={{ duration: 1.5 }}
            src={image || "https://images.unsplash.com/photo-1451187580459-43490279c0fa"}
            className="fixed inset-0 -z-10 h-full w-full object-cover"
            alt="bg"
          />
        )}
      </AnimatePresence>

      <div className="z-10 w-full max-w-6xl mt-10">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col md:flex-row gap-4 justify-center items-center mb-16"
        >
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchAllData()}
              placeholder="Para onde vamos? (Ex: Itália, Egito...)"
              className="w-full bg-white/10 backdrop-blur-xl border border-white/20 text-white pl-12 pr-6 py-4 rounded-3xl outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-white/40 shadow-2xl text-lg"
            />
          </div>
          <button
            onClick={fetchAllData}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-3xl font-bold tracking-widest uppercase transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_40px_rgba(37,99,235,0.4)]"
          >
            {loading ? "Mapeando..." : "Explorar"}
          </button>
        </motion.div>

        {/* Dashboard de Dados - Bento Grid */}
        <AnimatePresence>
          {country && (
            <motion.div
              variants={containerVars}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >

              {/* Header Card (Ocupa 2 colunas) */}
              <motion.div variants={itemVars} className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2rem] flex flex-col justify-center relative overflow-hidden group">
                {country.coatOfArms && (
                  <img src={country.coatOfArms} className="absolute -right-10 -bottom-10 h-64 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-700" alt="brasão" />
                )}
                <div className="flex items-center gap-6 z-10">
                  <img src={country.flag} className="w-32 h-20 object-cover rounded-xl shadow-2xl ring-1 ring-white/20" alt="bandeira" />
                  <div>
                    <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter">{country.name}</h1>
                    <p className="text-white/60 text-lg uppercase tracking-widest flex items-center gap-2 mt-2">
                      <MapPin size={18} /> {country.region} • {country.subregion}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Clima Card */}
              <motion.div variants={itemVars} className="bg-blue-900/40 backdrop-blur-md border border-blue-400/20 p-8 rounded-[2rem] flex flex-col justify-between items-start">
                <CloudSun className="text-blue-300 w-10 h-10 mb-4" />
                <h3 className="text-white/50 uppercase tracking-widest text-sm font-semibold mb-1">Clima Atual</h3>
                {weather ? (
                  <div>
                    <p className="text-white text-5xl font-light">{weather.temp}°C</p>
                    <p className="text-white/70 mt-2 text-sm">Vento: {weather.wind} km/h</p>
                  </div>
                ) : (
                  <p className="text-white/50 animate-pulse">Buscando satélite...</p>
                )}
              </motion.div>

              {/* População Card */}
              <motion.div variants={itemVars} className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2rem] flex flex-col justify-between">
                <Users className="text-purple-400 w-8 h-8 mb-4" />
                <h3 className="text-white/50 uppercase tracking-widest text-sm font-semibold mb-1">População</h3>
                <p className="text-white text-3xl font-bold">{country.population}</p>
              </motion.div>

              {/* Info Card - Idiomas & Moeda */}
              <motion.div variants={itemVars} className="md:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2rem] flex flex-col justify-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-xl"><Languages className="text-emerald-400" /></div>
                  <div>
                    <p className="text-white/50 text-xs uppercase tracking-widest">Idiomas Nativos</p>
                    <p className="text-white text-xl font-medium">{country.languages}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-xl"><Coins className="text-yellow-400" /></div>
                  <div>
                    <p className="text-white/50 text-xs uppercase tracking-widest">Moeda Local</p>
                    <p className="text-white text-xl font-medium">{country.currencies}</p>
                  </div>
                </div>
              </motion.div>

              {/* Info Card - Capital & Fuso */}
              <motion.div variants={itemVars} className="md:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2rem] flex flex-col justify-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-xl"><Globe2 className="text-red-400" /></div>
                  <div>
                    <p className="text-white/50 text-xs uppercase tracking-widest">Capital</p>
                    <p className="text-white text-xl font-medium">{country.capital}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-xl"><Clock className="text-blue-400" /></div>
                  <div>
                    <p className="text-white/50 text-xs uppercase tracking-widest">Fuso Horário</p>
                    <p className="text-white text-xl font-medium">{country.timezones}</p>
                  </div>
                </div>
              </motion.div>

              {/* Wiki Card (Ocupa a linha toda) */}
              <motion.div variants={itemVars} className="md:col-span-3 lg:col-span-4 bg-black/60 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] relative">
                <BookOpen className="absolute top-8 right-8 text-white/10 w-24 h-24" />
                <h3 className="text-white/50 uppercase tracking-widest text-sm font-semibold mb-4">Sobre o País</h3>
                {wiki ? (
                  <p className="text-white/80 text-lg leading-relaxed max-w-4xl">{wiki}</p>
                ) : (
                  <div className="space-y-2 max-w-4xl">
                    <div className="h-4 bg-white/10 rounded animate-pulse w-full"></div>
                    <div className="h-4 bg-white/10 rounded animate-pulse w-5/6"></div>
                    <div className="h-4 bg-white/10 rounded animate-pulse w-4/6"></div>
                  </div>
                )}
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}