```sql
CREATE TABLE usuarios (
id SERIAL PRIMARY KEY,
nombre VARCHAR(50),
balance FLOAT CHECK (balance >= 0)
);

CREATE TABLE transferencias (
id SERIAL PRIMARY KEY,
emisor INT,
receptor INT,
monto FLOAT,
fecha TIMESTAMP,
FOREIGN KEY (emisor) REFERENCES usuarios(id) ON DELETE CASCADE,
FOREIGN KEY (receptor) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- data dummy
INSERT INTO usuarios (nombre, balance) VALUES ('Pedro Sánchez', 956000);
INSERT INTO usuarios (nombre, balance) VALUES ('Sofía González', 423000);
INSERT INTO usuarios (nombre, balance) VALUES ('Luis Martínez', 187000);
INSERT INTO usuarios (nombre, balance) VALUES ('Isabel Fernández', 639500);
INSERT INTO usuarios (nombre, balance) VALUES ('Javier Ramírez', 890000);
INSERT INTO usuarios (nombre, balance) VALUES ('Carmen Torres', 345800);

```