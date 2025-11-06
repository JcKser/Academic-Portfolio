class Ponto {
    private double x;
    private double y;
    private int id;
    private static int nextID = 0;

    public Ponto() {
        this.x = 0;
        this.y = 0;
        this.id = nextID;
        nextID++;
    }

    public Ponto(double x, double y) {
        this.x = x;
        this.y = y;
        this.id = nextID;
        nextID++;
    }

    public double getX() {
        return x;
    }

    public void setX(double x) {
        this.x = x;
    }

    public double getY() {
        return y;
    }

    public void setY(double y) {
        this.y = y;
    }

    public int getID() {
        return id;
    }

    public static int getNextID() {
        return nextID;
    }

    public double dist(Ponto outroPonto) {
        double deltaX = this.x - outroPonto.x;
        double deltaY = this.y - outroPonto.y;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }

    public double dist(double x, double y) {
        double deltaX = this.x - x;
        double deltaY = this.y - y;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }

    public static double dist(double x1, double y1, double x2, double y2) {
        double deltaX = x1 - x2;
        double deltaY = y1 - y2;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }

    public static boolean isTriangulo(Ponto p1, Ponto p2, Ponto p3) {
        double d1 = p1.dist(p2);
        double d2 = p2.dist(p3);
        double d3 = p3.dist(p1);
        return (d1 + d2 > d3) && (d1 + d3 > d2) && (d2 + d3 > d1);
    }

    public double getAreaRetangulo(Ponto outroPonto) {
        double base = Math.abs(this.x - outroPonto.x);
        double altura = Math.abs(this.y - outroPonto.y);
        return base * altura;
    }
}

class LixaoPonto {
    public static void main(String[] args) {
        Ponto p1 = new Ponto(4, 3);
        Ponto p2 = new Ponto(8, 5);
        Ponto p3 = new Ponto(9.2, 10);
        
        System.out.println("Distancia p1 entre e p2: " + p1.dist(p2));
        System.out.println("Distancia p1 entre e (5,2): " + p1.dist(5, 2));
        System.out.println("Distancia (4,3) entre e (5,2): " + Ponto.dist(4, 3, 5, 2));
        System.out.println("P1, P2, P3 sao triangulo:" + Ponto.isTriangulo(p1, p2, p3));
        System.out.println("Area retangulo:" + p1.getAreaRetangulo(p2));
        System.out.println("ID de P1: " + p1.getID());
        System.out.println("ID de P2: " + p2.getID());
        System.out.println("ID de P3: " + p3.getID());
        System.out.println("Next ID: " + Ponto.getNextID());
    }
}
