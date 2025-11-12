import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface YogaClass {
  id: number;
  title: string;
  description: string;
  duration: number;
  price: number;
  max_participants: number;
}

interface ScheduleItem {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  duration: number;
  price: number;
  available_spots: number;
  booked_count: number;
  spots_left: number;
}

const API_URL = 'https://functions.poehali.dev/2e24d429-b915-499b-be0b-e52190b2d70f';

const Index = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [classes, setClasses] = useState<YogaClass[]>([]);
  const [activeSection, setActiveSection] = useState('home');
  const [selectedClass, setSelectedClass] = useState<ScheduleItem | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSchedule();
    fetchClasses();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await fetch(`${API_URL}?action=schedule`);
      const data = await response.json();
      setSchedule(data.schedule || []);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_URL}?action=classes`);
      const data = await response.json();
      setClasses(data.classes || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedule_id: selectedClass.id,
          ...formData
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Запись успешна!',
          description: 'Вы записаны на занятие. Ждём вас!',
        });
        setIsBookingOpen(false);
        setFormData({ client_name: '', client_email: '', client_phone: '' });
        fetchSchedule();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось записаться',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Проблема с подключением',
        variant: 'destructive'
      });
    }
  };

  const scrollToSection = (section: string) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Sparkles" size={24} className="text-primary" />
              <span className="text-xl font-semibold text-foreground">YogaFlow</span>
            </div>
            <div className="hidden md:flex gap-6">
              {['home', 'classes', 'schedule', 'pricing', 'about', 'reviews', 'blog', 'contact'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`text-sm transition-colors hover:text-primary ${
                    activeSection === section ? 'text-primary font-medium' : 'text-muted-foreground'
                  }`}
                >
                  {section === 'home' && 'Главная'}
                  {section === 'classes' && 'Занятия'}
                  {section === 'schedule' && 'Расписание'}
                  {section === 'pricing' && 'Цены'}
                  {section === 'about' && 'Обо мне'}
                  {section === 'reviews' && 'Отзывы'}
                  {section === 'blog' && 'Блог'}
                  {section === 'contact' && 'Контакты'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <section id="home" className="pt-24 pb-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <Badge variant="secondary" className="w-fit">Йога для души и тела</Badge>
              <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                Найдите баланс и гармонию
              </h1>
              <p className="text-lg text-muted-foreground">
                Практика йоги для начинающих и продолжающих. Индивидуальный подход, опытный инструктор, уютная студия.
              </p>
              <div className="flex gap-4">
                <Button size="lg" onClick={() => scrollToSection('schedule')} className="hover-scale">
                  Записаться на занятие
                </Button>
                <Button size="lg" variant="outline" onClick={() => scrollToSection('about')}>
                  Узнать больше
                </Button>
              </div>
            </div>
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
              <img
                src="https://cdn.poehali.dev/projects/63c5f6d7-aa21-4ca7-83d9-a4749154c65f/files/cbab7c05-7dc0-417e-aec5-b0493c203898.jpg"
                alt="Yoga Studio"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="classes" className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Виды занятий</Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4">Практики</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Выберите практику, которая подходит именно вам
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {classes.map((cls) => (
              <Card key={cls.id} className="hover-scale">
                <CardHeader>
                  <CardTitle className="text-xl">{cls.title}</CardTitle>
                  <CardDescription>{cls.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Icon name="Clock" size={16} />
                      <span>{cls.duration} минут</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Users" size={16} />
                      <span>До {cls.max_participants} человек</span>
                    </div>
                    <div className="flex items-center gap-2 font-semibold text-primary">
                      <Icon name="Wallet" size={16} />
                      <span>{cls.price} ₽</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="schedule" className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Расписание</Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4">Запись на занятия</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Выберите удобное время и запишитесь онлайн
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {schedule.map((item) => (
              <Card key={item.id} className="hover-scale">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {format(new Date(item.start_time), 'dd MMMM, HH:mm', { locale: ru })}
                      </CardDescription>
                    </div>
                    <Badge variant={item.spots_left > 0 ? 'default' : 'secondary'}>
                      {item.spots_left > 0 ? `${item.spots_left} мест` : 'Нет мест'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="font-semibold text-primary">{item.price} ₽</span>
                      <Dialog open={isBookingOpen && selectedClass?.id === item.id} onOpenChange={(open) => {
                        setIsBookingOpen(open);
                        if (open) setSelectedClass(item);
                      }}>
                        <DialogTrigger asChild>
                          <Button disabled={item.spots_left === 0} size="sm">
                            {item.spots_left > 0 ? 'Записаться' : 'Нет мест'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Запись на занятие</DialogTitle>
                            <DialogDescription>{item.title}</DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleBooking} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Имя *</Label>
                              <Input
                                id="name"
                                value={formData.client_name}
                                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email *</Label>
                              <Input
                                id="email"
                                type="email"
                                value={formData.client_email}
                                onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="phone">Телефон</Label>
                              <Input
                                id="phone"
                                type="tel"
                                value={formData.client_phone}
                                onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                              />
                            </div>
                            <Button type="submit" className="w-full">
                              Подтвердить запись
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Абонементы</Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4">Цены</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="hover-scale">
              <CardHeader>
                <CardTitle>Разовое посещение</CardTitle>
                <CardDescription>Попробуйте йогу</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-4">1 500 ₽</div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Icon name="Check" size={16} className="text-primary" />
                    <span>1 занятие</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="Check" size={16} className="text-primary" />
                    <span>Любая практика</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover-scale border-primary shadow-lg">
              <CardHeader>
                <Badge className="w-fit mb-2">Популярный</Badge>
                <CardTitle>Месячный абонемент</CardTitle>
                <CardDescription>8 занятий</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-4">9 600 ₽</div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Icon name="Check" size={16} className="text-primary" />
                    <span>8 занятий</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="Check" size={16} className="text-primary" />
                    <span>Любые практики</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="Check" size={16} className="text-primary" />
                    <span>Скидка 20%</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover-scale">
              <CardHeader>
                <CardTitle>Безлимит</CardTitle>
                <CardDescription>Неограниченно</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-4">12 000 ₽</div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Icon name="Check" size={16} className="text-primary" />
                    <span>Без ограничений</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="Check" size={16} className="text-primary" />
                    <span>Все практики</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="Check" size={16} className="text-primary" />
                    <span>Приоритетная запись</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="about" className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="space-y-6">
              <Badge variant="secondary" className="w-fit">Обо мне</Badge>
              <h2 className="text-4xl font-bold text-foreground">Анна Сергеева</h2>
              <p className="text-lg text-muted-foreground">
                Сертифицированный инструктор по йоге с 8-летним опытом. Прошла обучение в Индии и России.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Icon name="Award" size={20} className="text-primary" />
                  <span className="text-foreground">Сертификат международного стандарта (200 часов)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Icon name="Heart" size={20} className="text-primary" />
                  <span className="text-foreground">Более 1000 учеников</span>
                </div>
                <div className="flex items-center gap-3">
                  <Icon name="Sparkles" size={20} className="text-primary" />
                  <span className="text-foreground">Индивидуальный подход к каждому</span>
                </div>
              </div>
            </div>
            <div className="bg-muted rounded-2xl p-8 space-y-4">
              <h3 className="text-2xl font-semibold text-foreground">Философия практики</h3>
              <p className="text-muted-foreground">
                Йога — это не только физические упражнения, но и путь к гармонии тела и разума. 
                На своих занятиях я помогаю каждому найти свой уникальный путь в практике.
              </p>
              <p className="text-muted-foreground">
                Мы работаем с дыханием, учимся слушать своё тело и находим баланс между усилием и расслаблением.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="reviews" className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Отзывы</Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4">Что говорят ученики</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { name: 'Мария', text: 'Прекрасный инструктор! Занятия помогли мне обрести гибкость и спокойствие.', rating: 5 },
              { name: 'Дмитрий', text: 'Отличная студия, комфортная атмосфера. Рекомендую всем начинающим!', rating: 5 },
              { name: 'Елена', text: 'Анна — профессионал своего дела. После её занятий чувствую себя обновлённой.', rating: 5 }
            ].map((review, idx) => (
              <Card key={idx} className="hover-scale">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    {[...Array(review.rating)].map((_, i) => (
                      <Icon key={i} name="Star" size={16} className="fill-primary text-primary" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{review.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{review.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="blog" className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Блог</Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4">Статьи о йоге</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { title: '5 асан для начинающих', date: '10 ноября 2025' },
              { title: 'Как дыхание влияет на практику', date: '5 ноября 2025' },
              { title: 'Йога и медитация: путь к себе', date: '1 ноября 2025' }
            ].map((post, idx) => (
              <Card key={idx} className="hover-scale cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">{post.title}</CardTitle>
                  <CardDescription>{post.date}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" size="sm" className="px-0">
                    Читать далее
                    <Icon name="ArrowRight" size={16} className="ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Контакты</Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4">Свяжитесь со мной</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Icon name="MapPin" size={24} className="text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Адрес</h3>
                  <p className="text-muted-foreground">Москва, ул. Примерная, 10</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Icon name="Phone" size={24} className="text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Телефон</h3>
                  <p className="text-muted-foreground">+7 (999) 123-45-67</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Icon name="Mail" size={24} className="text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Email</h3>
                  <p className="text-muted-foreground">yoga@example.com</p>
                </div>
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Напишите мне</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Имя</Label>
                    <Input id="contact-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Email</Label>
                    <Input id="contact-email" type="email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Сообщение</Label>
                    <Input id="message" />
                  </div>
                  <Button type="submit" className="w-full">Отправить</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="bg-foreground text-background py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Icon name="Sparkles" size={20} />
            <span className="font-semibold">YogaFlow</span>
          </div>
          <p className="text-sm opacity-80">© 2025 YogaFlow. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
