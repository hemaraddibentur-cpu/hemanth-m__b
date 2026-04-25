import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ParkingCircle, ArrowRight, Shield, MapPin, CreditCard, BarChart3, Clock, Zap } from 'lucide-react';

const Landing = () => {
  const features = [
    { icon: MapPin, title: 'Smart Navigation', desc: 'Turn-by-turn directions to your assigned parking spot with real-time availability.' },
    { icon: Shield, title: 'Secure Entry', desc: 'QR code and RFID-based entry/exit with automated license plate verification.' },
    { icon: Clock, title: 'Pre-Booking', desc: 'Reserve your spot in advance with flexible hourly, daily, or monthly passes.' },
    { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Real-time occupancy monitoring, revenue tracking, and peak usage analysis.' },
    { icon: CreditCard, title: 'Digital Payments', desc: 'Seamless payments via UPI, cards, or wallets with instant invoice generation.' },
    { icon: Zap, title: 'Real-Time Updates', desc: 'Live slot availability, violation alerts, and booking notifications via WebSocket.' },
  ];

  return (
    <div className="min-h-screen bg-dark-950 overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center">
              <ParkingCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold gradient-text">ParkSmart</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-5 py-2 text-sm font-semibold text-dark-200 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary text-sm !py-2 !px-5">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 hero-gradient">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-8">
              <Zap className="w-4 h-4" /> Intelligent Campus Parking Solution
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-extrabold leading-tight mb-6">
              <span className="text-white">Park Smarter,</span>
              <br />
              <span className="gradient-text">Not Harder</span>
            </h1>
            <p className="text-lg md:text-xl text-dark-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Transform your campus parking experience with AI-powered slot allocation,
              real-time availability tracking, and seamless digital payments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary text-lg !py-4 !px-8 flex items-center gap-2 justify-center">
                Start Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="btn-secondary text-lg !py-4 !px-8 flex items-center gap-2 justify-center">
                View Demo
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto"
          >
            {[
              { value: '50+', label: 'Parking Slots' },
              { value: '5', label: 'Zones' },
              { value: '99.9%', label: 'Uptime' },
              { value: '24/7', label: 'Monitoring' },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-6 text-center">
                <p className="text-3xl font-display font-bold gradient-text">{stat.value}</p>
                <p className="text-sm text-dark-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-dark-400 text-lg max-w-xl mx-auto">
              A comprehensive parking management system designed for modern educational institutions.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card-hover p-8 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-cyan/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-dark-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center glass-card p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-accent-violet/10" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Ready to Transform Your Parking?
            </h2>
            <p className="text-dark-300 mb-8 max-w-lg mx-auto">
              Join campus communities that have already solved their parking chaos with ParkSmart.
            </p>
            <Link to="/register" className="btn-primary text-lg !py-4 !px-10 inline-flex items-center gap-2">
              Get Started Today <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-800 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ParkingCircle className="w-5 h-5 text-primary-500" />
            <span className="font-display font-bold text-white">ParkSmart</span>
          </div>
          <p className="text-sm text-dark-500">© 2024 ParkSmart. Built for educational institutions.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
