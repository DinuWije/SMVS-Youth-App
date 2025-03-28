"""remove test field

Revision ID: 845d3647e1b2
Revises: a11070c62f1b
Create Date: 2025-03-21 20:44:38.641873

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '845d3647e1b2'
down_revision = 'a11070c62f1b'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('article', 'test')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('article', sa.Column('test', sa.TEXT(), autoincrement=False, nullable=True))
    # ### end Alembic commands ###
